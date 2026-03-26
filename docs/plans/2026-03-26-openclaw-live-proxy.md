# OpenClaw Live Proxy Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the web validation console `Live` mode browser-runnable in both Vite dev and preview using same-origin proxy paths.

**Architecture:** Add shared Vite proxy rules for dev and preview, switch the web runtime to relative `Live` endpoints by default, then prove the browser path with unit, config, and Playwright coverage. Keep current business semantics unchanged: buyer API still owns the fixed replenishment flow and seller-sim remains a health probe target.

**Tech Stack:** React 19, TypeScript, Vite 7, Vitest, Playwright

---

### Task 1: Add Shared Vite Live Proxies

**Files:**
- Modify: `apps/web/vite.config.ts`
- Test: `tests/config/playwright-harness.test.ts`

**Step 1: Write the failing test**

Add assertions in `tests/config/playwright-harness.test.ts` that the Vite config exposes both dev and preview proxy entries for `/api/live` and `/seller/live`.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/config/playwright-harness.test.ts`

Expected: FAIL because `apps/web/vite.config.ts` is empty.

**Step 3: Write minimal implementation**

Define a shared proxy map in `apps/web/vite.config.ts` and export a config with both `server.proxy` and `preview.proxy`.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/config/playwright-harness.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/vite.config.ts tests/config/playwright-harness.test.ts
git commit -m "feat: add vite live proxy config"
```

### Task 2: Switch Live Runtime Defaults To Same-Origin Paths

**Files:**
- Modify: `apps/web/src/runtime/liveRuntime.ts`
- Modify: `apps/web/src/App.tsx`
- Test: `tests/web/live-runtime.test.ts`

**Step 1: Write the failing test**

Extend `tests/web/live-runtime.test.ts` to assert the default runtime calls `/api/live/...` and `/seller/live/...` when explicit base URLs are not provided.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/web/live-runtime.test.ts`

Expected: FAIL because the runtime still defaults to direct `127.0.0.1` URLs.

**Step 3: Write minimal implementation**

- Move the default live URLs into `liveRuntime.ts`
- Set defaults to `/api/live` and `/seller/live`
- Remove the hardcoded `127.0.0.1` constants from `App.tsx`
- Preserve explicit URL overrides for tests

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/web/live-runtime.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/src/runtime/liveRuntime.ts apps/web/src/App.tsx tests/web/live-runtime.test.ts
git commit -m "feat: use same-origin live runtime defaults"
```

### Task 3: Prove The Browser Live Path

**Files:**
- Modify: `tests/e2e/web-validation-console.spec.ts`
- Modify: `tests/config/playwright-harness.test.ts`

**Step 1: Write the failing test**

Add a second Playwright test that:

- opens the web console
- switches to `Live`
- clicks `开始演示`
- asserts health cards become `Healthy`
- asserts the runtime remains `Live`

**Step 2: Run test to verify it fails**

Run: `pnpm exec playwright test tests/e2e/web-validation-console.spec.ts`

Expected: FAIL before the proxy/runtime changes are complete.

**Step 3: Write minimal implementation**

Adjust any remaining harness/config assumptions so the new `Live` browser test runs in both `playwright test` and `test:e2e`.

**Step 4: Run test to verify it passes**

Run: `pnpm exec playwright test tests/e2e/web-validation-console.spec.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add tests/e2e/web-validation-console.spec.ts tests/config/playwright-harness.test.ts
git commit -m "test: cover live web validation path"
```

### Task 4: Update Docs To Match The New Local Live Path

**Files:**
- Modify: `README.md`
- Modify: `docs/web-validation-console.md`
- Modify: `tests/config/web-docs.test.ts`

**Step 1: Write the failing test**

Update `tests/config/web-docs.test.ts` so it expects:

- `pnpm dev:web` and `pnpm preview:web` support local Live runs
- no claim that extra same-origin proxy/CORS wiring is still required for local Vite runs
- seller-sim still only participates in the health probe path

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/config/web-docs.test.ts`

Expected: FAIL until the docs are updated.

**Step 3: Write minimal implementation**

Revise the README and console guide to describe:

- local Live support in dev and preview
- the current seller-sim limitation
- the investor walkthrough with real Live browser execution

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/config/web-docs.test.ts tests/config/operator-docs.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add README.md docs/web-validation-console.md tests/config/web-docs.test.ts
git commit -m "docs: update live console workflow"
```

### Task 5: Final Verification

**Files:**
- No new files

**Step 1: Run builds**

Run:

```bash
pnpm build
pnpm build:web
```

Expected: PASS

**Step 2: Run full test suites**

Run:

```bash
pnpm test
pnpm test:e2e
```

Expected: PASS

**Step 3: Summarize branch status**

Capture:

- final branch cleanliness via `git status --short --branch`
- final top commits via `git log --oneline --decorate -8`

**Step 4: Commit**

No commit in this task. Use the verification results to prepare merge/PR handoff.
