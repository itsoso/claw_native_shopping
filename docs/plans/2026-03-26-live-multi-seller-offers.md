# Live Multi-Seller Offer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the real Live replenishment path compare multiple seller-sim quotes and select one with the existing offer evaluator.

**Architecture:** Add a seller-sim quote-options endpoint, introduce a runtime quote collector that ranks real candidate quotes, and extend the orchestrator to record the selected offer path while preserving the existing hold and commit protocol for the chosen quote.

**Tech Stack:** TypeScript, Fastify, Vitest, Playwright, shared seller protocol schemas, offer evaluator

---

### Task 1: Add seller-sim multi-offer output

**Files:**
- Modify: `apps/seller-sim/src/data.ts`
- Modify: `apps/seller-sim/src/handlers.ts`
- Test: `tests/integration/seller-sim.test.ts`

**Step 1: Write the failing test**

Add a test that posts an RFQ to `POST /rfq/options` and asserts:

- the response is a non-empty array
- there is more than one seller for a supported category
- the returned quotes differ in seller id or cost/ETA

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/integration/seller-sim.test.ts`

Expected: FAIL because `POST /rfq/options` does not exist yet.

**Step 3: Write minimal implementation**

Add virtual seller profiles per category and implement the new endpoint to emit a `QuoteSchema[]`.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/integration/seller-sim.test.ts`

Expected: PASS

### Task 2: Add a runtime quote collector

**Files:**
- Create: `packages/seller-protocol/src/httpQuoteCollector.ts`
- Modify: `packages/seller-protocol/src/index.ts`
- Test: `tests/integration/seller-http-port.test.ts`

**Step 1: Write the failing test**

Extend integration coverage to assert a new collector can:

- call `POST /rfq/options`
- rank the returned candidates
- pick the expected seller

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/integration/seller-http-port.test.ts`

Expected: FAIL because the collector does not exist yet.

**Step 3: Write minimal implementation**

Create a collector that:

- fetches quote options
- maps them into `OfferCandidate`
- ranks them via `rankOffers`
- returns both the selected quote and ranked candidates

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/integration/seller-http-port.test.ts`

Expected: PASS

### Task 3: Use ranked quote collection in the orchestrator

**Files:**
- Modify: `packages/orchestrator/src/service.ts`
- Modify: `apps/api/src/server.ts`
- Modify: `apps/api/src/routes/intents.ts`
- Test: `tests/integration/api.test.ts`
- Test: `tests/e2e/replenishment-happy-path.test.ts`

**Step 1: Write the failing test**

Add tests requiring:

- audit trail includes an explicit ranked-offer selection event
- snapshot stores selected seller plus candidate count
- the end-to-end happy path still commits successfully

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/integration/api.test.ts tests/e2e/replenishment-happy-path.test.ts`

Expected: FAIL because the orchestrator still only requests one quote.

**Step 3: Write minimal implementation**

Allow `runProcurementScenario()` to accept an optional quote collector result and use it before hold/commit. Wire buyer API runtime to provide the real collector.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/integration/api.test.ts tests/e2e/replenishment-happy-path.test.ts`

Expected: PASS

### Task 4: Reflect ranked-offer selection in Web Live output

**Files:**
- Modify: `apps/web/src/runtime/liveRuntime.ts`
- Modify: `tests/web/live-runtime.test.ts`
- Modify: `tests/e2e/web-validation-console.spec.ts`
- Modify: `docs/web-validation-console.md`
- Modify: `README.md`
- Modify: `tests/config/web-docs.test.ts`

**Step 1: Write the failing test**

Add expectations that the Live output references:

- ranked seller candidates
- selected seller
- buyer API choosing from multiple offers

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/web/live-runtime.test.ts tests/config/web-docs.test.ts`

Expected: FAIL until the copy is updated.

**Step 3: Write minimal implementation**

Use the richer explanation/snapshot data to update the Live step copy and docs.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/web/live-runtime.test.ts tests/config/web-docs.test.ts`

Expected: PASS

### Task 5: Verify the whole system

**Files:**
- Verify only

**Step 1: Run focused verification**

Run:

```bash
pnpm vitest run tests/integration/seller-sim.test.ts tests/integration/seller-http-port.test.ts tests/integration/api.test.ts tests/web/live-runtime.test.ts tests/config/web-docs.test.ts
pnpm exec playwright test tests/e2e/web-validation-console.spec.ts
```

Expected: PASS

**Step 2: Run full verification**

Run:

```bash
pnpm build
pnpm build:web
pnpm test
pnpm test:e2e
pnpm lint
```

Expected: PASS
