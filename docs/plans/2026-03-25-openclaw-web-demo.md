# OpenClaw Web Demo Product Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a standalone household-first web demo for OpenClaw replenishment that runs locally, calls the real buyer API, supports an office scenario, and ships with automated verification.

**Architecture:** First repair the broken TypeScript and test baseline in the current branch so the repo can be trusted again. Then add a new Vite + React web app at `apps/web`, extend the buyer API with deterministic scenario inputs for household and office replenishment, and add component, integration, and browser E2E coverage around the full demo path.

**Tech Stack:** TypeScript, React 19, Vite, Fastify, Vitest, Playwright

---

### Task 1: Repair the existing TypeScript and verification baseline

**Files:**
- Modify: `tsconfig.base.json`
- Modify: `package.json`
- Modify: `tests/browser-extension/config/targets.test.ts`
- Modify: `tests/e2e/product-page.spec.ts`
- Modify: `tests/e2e/cart-page.spec.ts`
- Modify: `tests/browser-extension/storage/events.test.ts`
- Create or modify any missing `react` type dependency wiring if required by the compiler

**Step 1: Write the failing verification proof**

Run: `pnpm verify`
Expected: FAIL with current JSX and extension test import/type errors.

**Step 2: Add the minimum compiler and dependency fixes**

- add JSX support to the shared TypeScript baseline
- add any missing React type packages
- fix extension-style ESM import paths in tests
- update UUID-shaped fixture values in storage tests so they match the stricter type expectation

**Step 3: Run the focused checks**

Run: `pnpm typecheck`
Expected: PASS

Run: `pnpm test`
Expected: PASS or reveal only runtime test failures unrelated to type configuration

**Step 4: Run the full verification command**

Run: `pnpm verify`
Expected: PASS

**Step 5: Commit**

```bash
git add tsconfig.base.json package.json tests/browser-extension/config/targets.test.ts tests/e2e/product-page.spec.ts tests/e2e/cart-page.spec.ts tests/browser-extension/storage/events.test.ts
git commit -m "chore: repair repo verification baseline"
```

### Task 2: Scaffold the standalone web app

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/index.html`
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/app/App.tsx`
- Create: `apps/web/src/app/app.css`
- Modify: `package.json`

**Step 1: Write the failing smoke test**

Create `tests/web/app-shell.test.tsx` asserting that the app renders a household-first heading and both scenario tabs.

**Step 2: Run the test to verify it fails**

Run: `pnpm vitest run tests/web/app-shell.test.tsx`
Expected: FAIL because `apps/web` does not exist yet.

**Step 3: Write the minimal app scaffold**

- add Vite React app wiring under `apps/web`
- add root scripts `dev:web`, `start:web`, and `build:web`
- render a minimal app shell with household-first copy and scenario tabs

**Step 4: Run the test to verify it passes**

Run: `pnpm vitest run tests/web/app-shell.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/web package.json tests/web/app-shell.test.tsx
git commit -m "feat: scaffold standalone web demo app"
```

### Task 3: Add scenario-aware replenishment inputs to the buyer API

**Files:**
- Modify: `apps/api/src/routes/intents.ts`
- Modify: `packages/orchestrator/src/service.ts`
- Create: `packages/orchestrator/src/scenarios.ts`
- Modify: `tests/integration/api.test.ts`

**Step 1: Write the failing integration test**

Add tests that post a household scenario and an office scenario to `/intents/replenish`, then assert that both return deterministic results with scenario-specific metadata. Add a test for an approval-required override.

**Step 2: Run the focused integration test**

Run: `pnpm vitest run tests/integration/api.test.ts`
Expected: FAIL because the API currently ignores request payloads.

**Step 3: Write the minimal implementation**

- parse a typed request body for scenario id and optional demo overrides
- add deterministic scenario fixtures for `home` and `office`
- propagate scenario metadata into the orchestration result and stored snapshot

**Step 4: Run the integration test again**

Run: `pnpm vitest run tests/integration/api.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/routes/intents.ts packages/orchestrator/src/service.ts packages/orchestrator/src/scenarios.ts tests/integration/api.test.ts
git commit -m "feat: support scenario-driven demo replenishment"
```

### Task 4: Build the web data client and scenario state

**Files:**
- Create: `apps/web/src/lib/api.ts`
- Create: `apps/web/src/lib/scenarios.ts`
- Create: `apps/web/src/lib/types.ts`
- Create: `tests/web/api-client.test.ts`

**Step 1: Write the failing test**

Add a test for a thin client that triggers replenishment, fetches order details, and maps backend failures into typed UI states.

**Step 2: Run the test to verify it fails**

Run: `pnpm vitest run tests/web/api-client.test.ts`
Expected: FAIL because the client layer does not exist.

**Step 3: Write the minimal implementation**

- add typed fetch helpers for replenish, order snapshot, and explanation
- define local scenario metadata for home and office
- map network failures to a frontend-visible unavailable state

**Step 4: Run the test to verify it passes**

Run: `pnpm vitest run tests/web/api-client.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/src/lib tests/web/api-client.test.ts
git commit -m "feat: add web demo data client and scenario metadata"
```

### Task 5: Build the household-first product shell

**Files:**
- Modify: `apps/web/src/app/App.tsx`
- Modify: `apps/web/src/app/app.css`
- Create: `apps/web/src/components/HeroPanel.tsx`
- Create: `apps/web/src/components/ScenarioTabs.tsx`
- Create: `apps/web/src/components/InventoryPressurePanel.tsx`
- Create: `tests/web/home-dashboard.test.tsx`

**Step 1: Write the failing UI test**

Add a test that expects the household scenario to render inventory cards, a policy summary, and the main replenishment CTA by default.

**Step 2: Run the test to verify it fails**

Run: `pnpm vitest run tests/web/home-dashboard.test.tsx`
Expected: FAIL because the current shell does not render the dashboard.

**Step 3: Write the minimal implementation**

- build the hero and scenario tabs
- render inventory cards and policy summary for the selected scenario
- apply the approved warm editorial visual direction

**Step 4: Run the test to verify it passes**

Run: `pnpm vitest run tests/web/home-dashboard.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/src/app/App.tsx apps/web/src/app/app.css apps/web/src/components/HeroPanel.tsx apps/web/src/components/ScenarioTabs.tsx apps/web/src/components/InventoryPressurePanel.tsx tests/web/home-dashboard.test.tsx
git commit -m "feat: add household-first web demo shell"
```

### Task 6: Render procurement flow and order summary states

**Files:**
- Modify: `apps/web/src/app/App.tsx`
- Create: `apps/web/src/components/FlowTimeline.tsx`
- Create: `apps/web/src/components/OrderSummaryCard.tsx`
- Create: `tests/web/procurement-flow.test.tsx`

**Step 1: Write the failing UI test**

Add a test that simulates a successful replenishment response and expects the timeline and order summary to render user-facing statuses.

**Step 2: Run the test to verify it fails**

Run: `pnpm vitest run tests/web/procurement-flow.test.tsx`
Expected: FAIL because the app does not yet render procurement results.

**Step 3: Write the minimal implementation**

- call the replenish endpoint from the main CTA
- render timeline stages based on the backend result
- render selected seller, amount, and outcome in a summary card

**Step 4: Run the test to verify it passes**

Run: `pnpm vitest run tests/web/procurement-flow.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/src/app/App.tsx apps/web/src/components/FlowTimeline.tsx apps/web/src/components/OrderSummaryCard.tsx tests/web/procurement-flow.test.tsx
git commit -m "feat: show replenishment flow and order summary"
```

### Task 7: Add explanation drawer and error states

**Files:**
- Modify: `apps/web/src/app/App.tsx`
- Create: `apps/web/src/components/ExplanationDrawer.tsx`
- Create: `tests/web/explanation-drawer.test.tsx`

**Step 1: Write the failing UI test**

Add tests for:

- opening the explanation drawer after a run
- rendering approval-required outcome copy
- rendering backend-unavailable guidance

**Step 2: Run the test to verify it fails**

Run: `pnpm vitest run tests/web/explanation-drawer.test.tsx`
Expected: FAIL because explanation and error states are not implemented yet.

**Step 3: Write the minimal implementation**

- fetch `/orders/:id/explanation`
- render explanation events and snapshot details
- add offline and approval-required product states

**Step 4: Run the test to verify it passes**

Run: `pnpm vitest run tests/web/explanation-drawer.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/src/app/App.tsx apps/web/src/components/ExplanationDrawer.tsx tests/web/explanation-drawer.test.tsx
git commit -m "feat: add explanation drawer and demo error states"
```

### Task 8: Add office scenario behavior and scenario switching coverage

**Files:**
- Modify: `apps/web/src/app/App.tsx`
- Modify: `apps/web/src/lib/scenarios.ts`
- Create: `tests/web/scenario-switching.test.tsx`

**Step 1: Write the failing UI test**

Add a test that switches from home to office and expects office inventory, copy, and replenishment CTA text to update.

**Step 2: Run the test to verify it fails**

Run: `pnpm vitest run tests/web/scenario-switching.test.tsx`
Expected: FAIL because the scenario switch is not fully wired to the rendered dashboard.

**Step 3: Write the minimal implementation**

- connect the selected scenario to all visible panels
- adjust copy, policy summary, and cards for the office view

**Step 4: Run the test to verify it passes**

Run: `pnpm vitest run tests/web/scenario-switching.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/src/app/App.tsx apps/web/src/lib/scenarios.ts tests/web/scenario-switching.test.tsx
git commit -m "feat: support office replenishment demo flow"
```

### Task 9: Add browser E2E for the standalone product

**Files:**
- Create: `tests/e2e/web-demo.spec.ts`
- Modify: `package.json`

**Step 1: Write the failing E2E**

Add a Playwright test that:

- launches the web app and buyer API
- verifies household is the default scenario
- triggers replenishment
- opens the explanation drawer
- switches to office scenario

**Step 2: Run the E2E to verify it fails**

Run: `pnpm playwright test tests/e2e/web-demo.spec.ts`
Expected: FAIL because the app or scripts are not fully wired yet.

**Step 3: Write the minimal implementation**

- finalize runtime scripts for the web app
- adjust selectors and loading states so the flow is stable under Playwright

**Step 4: Run the E2E to verify it passes**

Run: `pnpm playwright test tests/e2e/web-demo.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/e2e/web-demo.spec.ts package.json
git commit -m "test: add end-to-end coverage for web demo app"
```

### Task 10: Final verification, review, and architecture conformance

**Files:**
- Modify: `docs/reviews/2026-03-22-openclaw-native-commerce-code-review.md`
- Modify: `docs/reviews/2026-03-22-openclaw-native-commerce-architecture-conformance.md`
- Optionally create a dedicated web demo review note if the existing review docs become too broad

**Step 1: Run the full verification suite**

Run: `pnpm verify`
Expected: PASS

Run: `pnpm playwright test tests/e2e/web-demo.spec.ts`
Expected: PASS

**Step 2: Compare code to the design doc**

Verify:

- household-first homepage exists
- office scenario exists
- flow visualization is user-facing
- explanation drawer is present
- buyer API drives the product

**Step 3: Write review notes**

Document any gaps, deliberate trade-offs, or deviations from `docs/plans/2026-03-25-openclaw-web-demo-design.md`.

**Step 4: Commit**

```bash
git add docs/reviews docs/plans/2026-03-25-openclaw-web-demo-design.md docs/plans/2026-03-25-openclaw-web-demo.md
git commit -m "docs: record web demo review and architecture conformance"
```
