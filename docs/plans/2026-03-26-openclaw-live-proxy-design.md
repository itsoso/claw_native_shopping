# OpenClaw Live Proxy Design

## Goal

Make the web validation console `Live` mode browser-runnable in both `pnpm dev:web` and `pnpm preview:web` by moving the frontend onto same-origin proxy paths instead of direct cross-origin calls to `127.0.0.1:3000` and `127.0.0.1:3100`.

## Current State

- [apps/web/src/App.tsx](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/apps/web/src/App.tsx) hardcodes `http://127.0.0.1:3000` and `http://127.0.0.1:3100`.
- [apps/web/src/runtime/liveRuntime.ts](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/apps/web/src/runtime/liveRuntime.ts) fetches those origins directly from the browser.
- [apps/web/vite.config.ts](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/apps/web/vite.config.ts) is empty, so neither dev nor preview provides a proxy layer.
- The current docs are forced to describe `Live` as a non-browser-ready integration target because the browser cannot safely call the local services directly.

## Recommended Approach

Use Vite as the local same-origin gateway for both dev and preview.

- Add shared proxy rules in [apps/web/vite.config.ts](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/apps/web/vite.config.ts).
- Route frontend `Live` requests through relative paths:
  - `/api/live/*` -> buyer API
  - `/seller/live/*` -> seller-sim
- Keep the existing `LiveRuntimeOptions` URL overrides so tests can still inject explicit hosts.
- Do not change the current business semantics:
  - seller-sim remains a health probe target only
  - buyer API still runs the fixed replenishment scenario through its in-process adapter

This is the smallest change that makes the browser path genuinely usable while preserving the current architecture and tests.

## Request Flow

### Demo

Unchanged:

- UI invokes [runDemoScenario](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/apps/web/src/runtime/demoRuntime.ts)
- no backend dependency

### Live

New browser-visible flow:

1. Browser requests `/api/live/health`
2. Browser requests `/seller/live/health`
3. Browser requests `/api/live/intents/replenish`
4. Browser requests `/api/live/orders/:id/explanation`
5. Vite proxies those requests to `127.0.0.1:3000` and `127.0.0.1:3100`
6. UI renders the result as the same shared `RunViewModel`

## Testing Strategy

- Update unit coverage in [tests/web/live-runtime.test.ts](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/tests/web/live-runtime.test.ts) to assert the new default relative paths.
- Extend [tests/config/playwright-harness.test.ts](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/tests/config/playwright-harness.test.ts) so it guards the presence of the web live proxy configuration.
- Extend [tests/e2e/web-validation-console.spec.ts](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/tests/e2e/web-validation-console.spec.ts) with a real `Live` browser smoke path.
- Update [tests/config/web-docs.test.ts](/Users/liqiuhua/work/claw_native_kshop/.worktrees/openclaw-web-validation/tests/config/web-docs.test.ts) and docs to say `Live` is browser-runnable in local dev/preview, while keeping the seller-sim limitation explicit.

## Risks And Non-Goals

- This does not make seller-sim part of the real replenishment path.
- This does not add backend CORS support.
- This does not change the buyer API contract or pass scenario/mode to the backend.
- The proxy only applies to Vite-hosted environments; a separately deployed static host would still need its own gateway.
