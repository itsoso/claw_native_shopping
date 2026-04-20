# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

OpenClaw Shopping Copilot — a Chrome extension (MV3) that injects AI-driven decision cards on JD.com (京东) product and cart pages. Uses deterministic rules (no model calls) and stores all data locally via `chrome.storage.local`. The repo also contains a backend procurement orchestration system with domain-driven packages for an AI-driven seller platform.

## Commands

```bash
pnpm install          # install all workspace dependencies
pnpm dev              # run browser extension in WXT dev mode (hot reload)
pnpm build            # build extension → apps/browser-extension/.output/chrome-mv3
pnpm test             # run all Vitest tests (unit + integration)
pnpm test:e2e         # run Playwright browser tests against static JD fixtures
pnpm lint             # ESLint
pnpm typecheck        # tsc --noEmit (root tsconfig + @claw/web tsconfig)
pnpm verify           # lint + typecheck + test (pre-merge gate)

# Run a single test file
pnpm vitest run tests/browser-extension/parsers/product.test.ts

# Web validation console
pnpm dev:web          # Vite dev server on port 5173
pnpm build:web        # production build for @claw/web
pnpm preview:web      # preview build on port 4174

# Backend servers
pnpm dev:api              # Fastify buyer API on port 3000
pnpm dev:seller-sim       # Fastify seller simulator on port 3100
pnpm dev:verification-api # Fastify verification mock API on port 3200
```

## Architecture

### Three surfaces

**Browser Extension** (`apps/browser-extension/`) — the current MVP focus. Built with WXT + React 19. Content scripts inject shadow-root overlays on `item.jd.com` and `cart.jd.com`. Three decision modes: `time_saving` (更省时间), `cautious` (更稳妥), `cost_saving` (更划算).

**Web Validation Console** (`apps/web/`) — standalone Vite + React 19 app for demonstrating the procurement orchestration flow. Has two runtime modes: demo (canned scenarios) and live (real API calls). Uses Bundler module resolution (not NodeNext like the rest of the repo).

**Backend Procurement** (`apps/api/`, `apps/seller-sim/`, `packages/`) — domain-driven procurement state machine. Not yet wired to the extension.

**Verification Service** (`apps/verification-api/`) — mock API serving structured quality verification data for food/agricultural products. Used by the browser extension to display verification badges on product pages. Phase 0 MVP for the Agent Native verification network.

### Monorepo layout

- **pnpm workspaces** — `packages/*`, `apps/browser-extension`, and `apps/web` are workspace members
- `apps/api` and `apps/seller-sim` are NOT workspace members; they import packages via relative paths (e.g., `../../../packages/memory/src/store.js`)
- All packages are ESM (`"type": "module"`) and use `.js` extensions in imports (NodeNext resolution)

### Extension internals (`apps/browser-extension/src/`)

`parsers/` → DOM scraping for product/cart data  
`recommendation/` → deterministic decision logic (`buildProductDecision`, `buildCartPlan`)  
`ui/` → React components (`DecisionCard`, `PreferenceMode`)  
`storage/` → `chrome.storage.local` wrappers for events + preferences  
`entrypoints/` → WXT content script entry points  
`config/` → URL match patterns for JD pages  

### Domain packages (`packages/`)

`orchestrator` — procurement state machine (sourcing → quoteCollection → offerSelected → inventoryHeld → paymentAuthorized → orderCommitted → fulfillmentStarted)  
`contracts` — Zod schemas shared across domain boundaries  
`seller-protocol` — RFQ/Quote/InventoryHold/OrderCommit message schemas  
`policy-engine` — auto-approve limits, blocked sellers, certification checks  
`offer-evaluator` — offer ranking by cost, ETA, trust, policy match  
`catalog`, `checkout`, `demand-planner`, `fulfillment`, `memory`, `shared` — supporting domain packages

### Testing

- Tests are centralized under `tests/`, organized by package/domain name
- Vitest with `globals: true` and jsdom environment for React component tests
- Playwright e2e tests build the extension first, then serve static HTML fixtures via `python3 -m http.server` on port 4173
- E2e fixtures at `tests/e2e/fixtures/` simulate JD product and cart pages

### TypeScript config

Strict mode with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` enabled. Target ES2022, NodeNext module resolution.

**Split typechecking**: `apps/web` and `tests/web` are excluded from the root `tsconfig.base.json` because `@claw/web` uses Bundler module resolution and DOM libs. The `pnpm typecheck` script runs both `tsc -p tsconfig.base.json` and `pnpm --filter @claw/web typecheck`.

**Path alias**: `@extension/*` maps to `apps/browser-extension/src/*` — defined in both `vitest.config.ts` (resolve alias) and `apps/web/tsconfig.json` (paths). Use this alias in tests and the web app when importing extension code.

## Collaboration Model

This repo follows the [Technical Co-Founder Operating Model](./docs/technical-cofounder-operating-model.md): treat product work as real product development, build in visible stages, test each increment, and stop at important decision points rather than making hidden product decisions.
