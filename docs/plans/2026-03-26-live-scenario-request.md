# Live Scenario Request Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make Web Live scenario and mode selections affect the real buyer API replenishment request instead of only changing presentation copy.

**Architecture:** Add a shared request contract, map `(scenarioId, mode)` to procurement inputs in the orchestrator layer, send that request body from the Web runtime, and return enough snapshot context for the Live timeline to reflect the chosen path.

**Tech Stack:** TypeScript, Zod, Fastify, React, Vitest, Playwright

---

### Task 1: Add a shared Live request contract

**Files:**
- Create: `packages/contracts/src/live-replenishment.ts`
- Modify: `packages/contracts/src/index.ts`
- Test: `tests/contract/live-replenishment.test.ts`

**Step 1: Write the failing test**

Add a contract test that validates:

- valid `scenarioId` values
- valid `mode` values
- invalid values are rejected

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/contract/live-replenishment.test.ts`

Expected: FAIL because the contract file does not exist yet.

**Step 3: Write minimal implementation**

Create a Zod schema and exported types for the Live request body.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/contract/live-replenishment.test.ts`

Expected: PASS

### Task 2: Make buyer API accept scenario-aware Live requests

**Files:**
- Modify: `apps/api/src/routes/intents.ts`
- Create: `packages/orchestrator/src/liveProfiles.ts`
- Modify: `packages/orchestrator/src/service.ts`
- Test: `tests/integration/api.test.ts`

**Step 1: Write the failing test**

Extend API integration coverage so:

- one Live request with `replenish-laundry/time_saving` returns one category/budget profile
- another Live request with `seller-eta-tradeoff/value` returns a different category/budget profile

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/integration/api.test.ts`

Expected: FAIL because `/intents/replenish` does not parse or apply the request body yet.

**Step 3: Write minimal implementation**

Add a profile mapper that converts the request body into:

- inventory
- catalog map
- planning defaults
- snapshot metadata

Update `runProcurementScenario()` to use those values instead of the fixed default when provided.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/integration/api.test.ts`

Expected: PASS

### Task 3: Send the real request body from Web Live

**Files:**
- Modify: `apps/web/src/runtime/liveRuntime.ts`
- Test: `tests/web/live-runtime.test.ts`

**Step 1: Write the failing test**

Extend the runtime test to require:

- `POST /api/live/intents/replenish` uses JSON body
- body contains `scenarioId` and `mode`

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/web/live-runtime.test.ts`

Expected: FAIL because the runtime still posts with no body.

**Step 3: Write minimal implementation**

Update `createLiveRuntime().run()` to send the shared request body contract.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/web/live-runtime.test.ts`

Expected: PASS

### Task 4: Reflect the chosen scenario in Live output

**Files:**
- Modify: `apps/web/src/runtime/liveRuntime.ts`
- Modify: `docs/web-validation-console.md`
- Modify: `README.md`
- Modify: `tests/config/web-docs.test.ts`

**Step 1: Write the failing test**

Require docs and runtime copy to mention that:

- Live sends the chosen scenario and mode into the buyer API
- snapshot details in the UI come from the real Live request

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/config/web-docs.test.ts tests/web/live-runtime.test.ts`

Expected: FAIL until the copy is updated.

**Step 3: Write minimal implementation**

Use snapshot fields from the explanation response to make Live step text more specific and update docs accordingly.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/config/web-docs.test.ts tests/web/live-runtime.test.ts`

Expected: PASS

### Task 5: Verify the whole system

**Files:**
- Verify only

**Step 1: Run focused checks**

Run:

```bash
pnpm vitest run tests/contract/live-replenishment.test.ts tests/integration/api.test.ts tests/web/live-runtime.test.ts tests/config/web-docs.test.ts
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
