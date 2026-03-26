# Seller-Sim Live Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the buyer API default replenishment path use the real seller-sim protocol so Web Live mode represents a genuine buyer API to seller-sim flow.

**Architecture:** Add a reusable HTTP `SellerProtocolPort`, inject it into the buyer API runtime through `SELLER_SIM_BASE_URL`, then update tests and Live-facing copy so the product story matches the real runtime path. Do not keep a silent in-memory fallback in the buyer API path.

**Tech Stack:** TypeScript, Fastify, Vite, Vitest, Playwright, shared Zod protocol schemas

---

### Task 1: Add a production HTTP seller protocol adapter

**Files:**
- Create: `packages/seller-protocol/src/httpPort.ts`
- Test: `tests/integration/seller-http-port.test.ts`

**Step 1: Write the failing test**

Create a test that boots `buildSellerSimServer()` and asserts a new `createSellerHttpPort()` can:

- request a quote
- hold inventory
- commit an order

Also add a failure test where the category is unsupported and assert the port throws a stable seller request error.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/integration/seller-http-port.test.ts`

Expected: FAIL because `packages/seller-protocol/src/httpPort.ts` does not exist yet.

**Step 3: Write minimal implementation**

Implement `createSellerHttpPort({ baseUrl, fetch? })` that:

- builds absolute URLs from `baseUrl`
- sends the three seller-sim requests
- parses successful responses with `QuoteSchema`, `InventoryHoldSchema`, and `OrderCommitSchema`
- throws on non-2xx responses with a message that includes the method/path/status

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/integration/seller-http-port.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add packages/seller-protocol/src/httpPort.ts tests/integration/seller-http-port.test.ts
git commit -m "feat: add seller http protocol port"
```

### Task 2: Wire buyer API to the real seller-sim runtime

**Files:**
- Modify: `apps/api/src/server.ts`
- Modify: `apps/api/src/routes/intents.ts`
- Test: `tests/integration/api.test.ts`

**Step 1: Write the failing test**

Add an API integration test that starts a real seller-sim server on an ephemeral port, builds the buyer API with that base URL, posts to `/intents/replenish`, then reads `/orders/:id/explanation` and asserts seller-backed events are present.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/integration/api.test.ts`

Expected: FAIL because the buyer API is still using the in-memory seller adapter and cannot be pointed at a real seller-sim base URL.

**Step 3: Write minimal implementation**

Update the buyer API so it:

- reads `SELLER_SIM_BASE_URL` with default `http://127.0.0.1:3100`
- creates a runtime seller HTTP port once during startup
- passes that port to `registerIntentRoutes()`
- passes it into `runProcurementScenario({ store, sellerPort })`

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/integration/api.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/server.ts apps/api/src/routes/intents.ts tests/integration/api.test.ts
git commit -m "feat: wire buyer api to seller sim"
```

### Task 3: Prove the failure path stays explicit

**Files:**
- Modify: `tests/integration/api.test.ts`
- Modify: `tests/web/runtime-switching.test.tsx`

**Step 1: Write the failing test**

Add one API test that points the buyer API at a dead seller-sim base URL and asserts `POST /intents/replenish` fails.

Add one Web runtime-switching assertion that the fallback copy still appears when the live API path fails.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/integration/api.test.ts tests/web/runtime-switching.test.tsx`

Expected: FAIL until the new runtime wiring propagates a stable service failure.

**Step 3: Write minimal implementation**

Ensure the seller HTTP port and buyer API surface stable runtime errors without silently recovering to the in-memory seller adapter.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/integration/api.test.ts tests/web/runtime-switching.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add tests/integration/api.test.ts tests/web/runtime-switching.test.tsx
git commit -m "test: cover seller sim live failure path"
```

### Task 4: Update Web Live copy and docs

**Files:**
- Modify: `apps/web/src/runtime/liveRuntime.ts`
- Modify: `docs/web-validation-console.md`
- Modify: `README.md`
- Modify: `tests/config/web-docs.test.ts`
- Modify: `tests/e2e/web-validation-console.spec.ts`

**Step 1: Write the failing test**

Add doc or copy assertions that say:

- seller-sim now participates in the real replenishment path
- Web Live is showing a buyer API plus seller-sim flow

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/config/web-docs.test.ts`

Expected: FAIL because the docs and copy still describe seller-sim as health-only.

**Step 3: Write minimal implementation**

Update runtime step copy and docs so they describe the real seller-sim-backed path without claiming features that still do not exist.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/config/web-docs.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/src/runtime/liveRuntime.ts docs/web-validation-console.md README.md tests/config/web-docs.test.ts tests/e2e/web-validation-console.spec.ts
git commit -m "docs: describe seller sim live path"
```

### Task 5: Run the full verification sweep

**Files:**
- Verify only

**Step 1: Run focused verification**

Run:

```bash
pnpm vitest run tests/integration/seller-http-port.test.ts tests/integration/api.test.ts tests/web/runtime-switching.test.tsx tests/config/web-docs.test.ts
pnpm exec playwright test tests/e2e/web-validation-console.spec.ts
```

Expected: PASS

**Step 2: Run full project verification**

Run:

```bash
pnpm build
pnpm build:web
pnpm test
pnpm test:e2e
pnpm lint
```

Expected: PASS

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: route live replenishment through seller sim"
```
