# Backend Transaction Cleanup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Clean up the backend transaction chain so seller runtime wiring, seller HTTP protocol handling, and procurement orchestration helpers are easier to reason about without changing the real Live behavior.

**Architecture:** Extract seller runtime resolution from the API server bootstrap, create shared seller HTTP helpers consumed by both HTTP adapters, and split the orchestrator service into small internal helpers so the public scenario runner reads like the transaction flow instead of a fixture harness.

**Tech Stack:** TypeScript, Fastify, Vitest, shared seller protocol schemas, in-memory store, seller-sim integration

---

### Task 1: Add failing tests for seller runtime and HTTP helper boundaries

**Files:**
- Create: `tests/integration/server-runtime.test.ts`
- Modify: `tests/integration/seller-http-port.test.ts`
- Test: `tests/integration/server-runtime.test.ts`
- Test: `tests/integration/seller-http-port.test.ts`

**Step 1: Write the failing test**

Add tests that require:

- seller runtime resolution returns the default base URL when no override is provided
- explicit `sellerPort` injection does not create a default HTTP quote collector
- shared seller HTTP helpers preserve the current non-2xx error wording and injected `fetch` behavior

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm vitest run tests/integration/server-runtime.test.ts tests/integration/seller-http-port.test.ts
```

Expected: FAIL because no isolated runtime resolver exists and the HTTP helper layer is not shared yet.

**Step 3: Write minimal implementation**

Create the runtime resolver and shared seller HTTP helper with only the behavior required by the tests.

**Step 4: Run test to verify it passes**

Run:

```bash
pnpm vitest run tests/integration/server-runtime.test.ts tests/integration/seller-http-port.test.ts
```

Expected: PASS

### Task 2: Refactor API seller runtime wiring

**Files:**
- Create: `apps/api/src/sellerRuntime.ts`
- Modify: `apps/api/src/server.ts`
- Test: `tests/integration/server-runtime.test.ts`
- Test: `tests/integration/api.test.ts`

**Step 1: Write the failing test**

Extend runtime tests so they require:

- `buildServer()` uses the resolved runtime instead of local branching
- configured `sellerBaseUrl` still drives the real replenishment path
- unavailable seller service still fails explicitly

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm vitest run tests/integration/server-runtime.test.ts tests/integration/api.test.ts
```

Expected: FAIL until server wiring is moved into the dedicated resolver.

**Step 3: Write minimal implementation**

Move seller runtime branching into `apps/api/src/sellerRuntime.ts` and update `buildServer()` to consume the resolved object.

**Step 4: Run test to verify it passes**

Run:

```bash
pnpm vitest run tests/integration/server-runtime.test.ts tests/integration/api.test.ts
```

Expected: PASS

### Task 3: Extract seller HTTP client helpers and remove duplication

**Files:**
- Create: `packages/seller-protocol/src/httpClient.ts`
- Modify: `packages/seller-protocol/src/httpPort.ts`
- Modify: `packages/seller-protocol/src/httpQuoteCollector.ts`
- Test: `tests/integration/seller-http-port.test.ts`

**Step 1: Write the failing test**

Add expectations that both HTTP adapters:

- build seller URLs consistently
- preserve the existing seller request error prefixes
- still accept injected `fetch`

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm vitest run tests/integration/seller-http-port.test.ts
```

Expected: FAIL until both adapters use the same helper behavior.

**Step 3: Write minimal implementation**

Introduce the shared HTTP helper and update both adapters to use it.

**Step 4: Run test to verify it passes**

Run:

```bash
pnpm vitest run tests/integration/seller-http-port.test.ts
```

Expected: PASS

### Task 4: Extract orchestrator helpers while keeping transaction behavior intact

**Files:**
- Modify: `packages/orchestrator/src/service.ts`
- Test: `tests/integration/procurement-service.test.ts`
- Test: `tests/integration/api.test.ts`
- Test: `tests/contract/live-replenishment.test.ts`

**Step 1: Write the failing test**

Add or tighten expectations that:

- committed path still records ranked offer context and fulfillment status
- approval-required path still records policy decision and request metadata
- inventory-hold-failed path still returns retry with the expected snapshot fields

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm vitest run tests/integration/procurement-service.test.ts tests/integration/api.test.ts tests/contract/live-replenishment.test.ts
```

Expected: FAIL once helper extraction begins if behavior drifts.

**Step 3: Write minimal implementation**

Split helper responsibilities out of `runProcurementScenario()` without changing the public result contract.

**Step 4: Run test to verify it passes**

Run:

```bash
pnpm vitest run tests/integration/procurement-service.test.ts tests/integration/api.test.ts tests/contract/live-replenishment.test.ts
```

Expected: PASS

### Task 5: Verify the whole backend transaction chain

**Files:**
- Verify only

**Step 1: Run focused verification**

Run:

```bash
pnpm vitest run tests/integration/server-runtime.test.ts tests/integration/seller-http-port.test.ts tests/integration/procurement-service.test.ts tests/integration/api.test.ts tests/contract/live-replenishment.test.ts
```

Expected: PASS

**Step 2: Run full verification**

Run:

```bash
pnpm build
pnpm test
pnpm test:e2e
pnpm lint
```

Expected: PASS

### Task 6: Commit the backend cleanup

**Files:**
- Modify: `apps/api/src/server.ts`
- Modify: `packages/orchestrator/src/service.ts`
- Modify: `packages/seller-protocol/src/httpPort.ts`
- Modify: `packages/seller-protocol/src/httpQuoteCollector.ts`
- Create: `apps/api/src/sellerRuntime.ts`
- Create: `packages/seller-protocol/src/httpClient.ts`
- Create: `tests/integration/server-runtime.test.ts`

**Step 1: Stage the verified changes**

Run:

```bash
git add apps/api/src/sellerRuntime.ts apps/api/src/server.ts packages/seller-protocol/src/httpClient.ts packages/seller-protocol/src/httpPort.ts packages/seller-protocol/src/httpQuoteCollector.ts packages/orchestrator/src/service.ts tests/integration/server-runtime.test.ts tests/integration/seller-http-port.test.ts tests/integration/procurement-service.test.ts tests/integration/api.test.ts tests/contract/live-replenishment.test.ts docs/plans/2026-03-27-backend-transaction-cleanup-design.md docs/plans/2026-03-27-backend-transaction-cleanup.md
```

**Step 2: Commit**

Run:

```bash
git commit -m "refactor: clean up backend transaction chain"
```

Expected: clean commit containing the backend cleanup and its plan docs
