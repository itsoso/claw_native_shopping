# OpenClaw Native Commerce Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a locally runnable MVP of a buyer-agent-first ecommerce kernel that can detect replenishment needs, request quotes from seller agents, enforce policy, commit orders safely, monitor fulfillment, and explain each decision.

**Architecture:** The implementation uses a TypeScript monorepo with explicit package boundaries. A deterministic orchestrator owns state transitions while specialist modules handle planning, policy, catalog normalization, protocol translation, checkout, fulfillment, and audit logging behind typed ports.

**Tech Stack:** Node.js 22, TypeScript, pnpm workspaces, Vitest, Zod, Fastify, XState or a typed state-machine wrapper, ESLint, Prettier.

---

## Execution Rules

- Use a fresh subagent per task when implementation starts.
- Do not overlap implementation tasks that edit the same files.
- Run unit or integration tests after every task.
- Keep each commit scoped to one task.
- Prefer mocks and local simulators over external services.
- Every public contract must have a validation test.
- Every task ends with a review checkpoint before continuing.

---

### Task 1: Initialize Workspace and Tooling

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `vitest.config.ts`
- Create: `.gitignore`
- Create: `packages/contracts/package.json`
- Create: `packages/shared/package.json`
- Create: `tests/.gitkeep`

**Step 1: Write the failing test**

Create `tests/workspace/tooling.test.ts`:

```ts
import { describe, expect, it } from "vitest";

describe("workspace tooling", () => {
  it("loads the shared tsconfig path alias", () => {
    expect(true).toBe(true);
  });
});
```

**Step 2: Run test to verify the workspace is not ready yet**

Run: `pnpm vitest run tests/workspace/tooling.test.ts`
Expected: command fails because workspace dependencies are not installed or config is missing.

**Step 3: Write minimal implementation**

Add:

- root `package.json` with `pnpm`, `vitest`, `typescript`, `eslint`, `prettier`
- workspace packages manifest
- base tsconfig with strict mode
- vitest config for workspace test discovery

**Step 4: Run test to verify it passes**

Run: `pnpm install && pnpm vitest run tests/workspace/tooling.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add package.json pnpm-workspace.yaml tsconfig.base.json vitest.config.ts .gitignore packages tests
git commit -m "chore: initialize workspace tooling"
```

---

### Task 2: Add Shared Domain Types and Result Helpers

**Files:**
- Create: `packages/shared/src/result.ts`
- Create: `packages/shared/src/ids.ts`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/tsconfig.json`
- Test: `tests/shared/result.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { ok, err } from "../../packages/shared/src/result";

describe("result helpers", () => {
  it("creates ok and err variants", () => {
    expect(ok(1)).toEqual({ ok: true, value: 1 });
    expect(err("x")).toEqual({ ok: false, error: "x" });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/shared/result.test.ts`
Expected: FAIL with module not found

**Step 3: Write minimal implementation**

Implement:

- `Result<T, E>`
- `ok(value)`
- `err(error)`
- typed ID factories for core entities

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/shared/result.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/shared tests/shared/result.test.ts
git commit -m "feat: add shared result and id helpers"
```

---

### Task 3: Define Core Contracts and Validation Schemas

**Files:**
- Create: `packages/contracts/src/demand-intent.ts`
- Create: `packages/contracts/src/policy-profile.ts`
- Create: `packages/contracts/src/offer.ts`
- Create: `packages/contracts/src/trade-contract.ts`
- Create: `packages/contracts/src/order-event.ts`
- Create: `packages/contracts/src/index.ts`
- Create: `packages/contracts/tsconfig.json`
- Test: `tests/contract/contracts-schema.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { DemandIntentSchema } from "../../packages/contracts/src/demand-intent";

describe("contract schemas", () => {
  it("parses a demand intent", () => {
    const parsed = DemandIntentSchema.parse({
      id: "intent_1",
      category: "eggs",
      normalizedAttributes: { raising_method: "free_range" },
      quantity: 2,
      urgency: "soon",
      deliveryWindow: { latestAt: "2026-03-23T10:00:00+08:00" },
      budgetLimit: 40,
      substitutionPolicy: "allowed",
      sourceSignals: ["inventory_threshold"]
    });

    expect(parsed.category).toBe("eggs");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/contract/contracts-schema.test.ts`
Expected: FAIL with missing schema modules

**Step 3: Write minimal implementation**

Create Zod schemas and exported types for:

- `DemandIntent`
- `PolicyProfile`
- `Offer`
- `TradeContract`
- `OrderEvent`

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/contract/contracts-schema.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/contracts tests/contract/contracts-schema.test.ts
git commit -m "feat: add validated commerce contracts"
```

---

### Task 4: Document Research Assumptions and Open Questions

**Files:**
- Create: `docs/research/2026-03-22-openclaw-native-commerce-research.md`
- Test: none

**Step 1: Write the failing test**

No code test. Instead define a checklist in the document header for:

- domain assumptions
- MVP boundaries
- open protocol questions
- target vertical recommendation

**Step 2: Verify absence**

Run: `test -f docs/research/2026-03-22-openclaw-native-commerce-research.md`
Expected: exit code 1

**Step 3: Write minimal implementation**

Create the research document with:

- target initial vertical
- assumptions for demand sensing
- policy/risk assumptions
- unresolved questions

**Step 4: Verify it exists**

Run: `test -f docs/research/2026-03-22-openclaw-native-commerce-research.md`
Expected: exit code 0

**Step 5: Commit**

```bash
git add docs/research/2026-03-22-openclaw-native-commerce-research.md
git commit -m "docs: add research assumptions for native commerce"
```

---

### Task 5: Implement Canonical Catalog Schemas and Normalizer

**Files:**
- Create: `packages/catalog/src/spec.ts`
- Create: `packages/catalog/src/normalize.ts`
- Create: `packages/catalog/src/substitution.ts`
- Create: `packages/catalog/src/index.ts`
- Create: `packages/catalog/package.json`
- Create: `packages/catalog/tsconfig.json`
- Test: `tests/catalog/normalize.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { normalizeProductSpec } from "../../packages/catalog/src/normalize";

describe("normalizeProductSpec", () => {
  it("maps seller attributes into canonical egg attributes", () => {
    const normalized = normalizeProductSpec({
      sellerProductId: "s1",
      category: "eggs",
      attributes: { count: "12", raisingMethod: "Free Range" }
    });

    expect(normalized.attributes).toEqual({
      count: 12,
      raising_method: "free_range"
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/catalog/normalize.test.ts`
Expected: FAIL with missing function

**Step 3: Write minimal implementation**

Implement:

- canonical product spec schema
- attribute normalizer for target category
- substitution scoring helper

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/catalog/normalize.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/catalog tests/catalog/normalize.test.ts
git commit -m "feat: add canonical catalog normalization"
```

---

### Task 6: Implement Policy Engine

**Files:**
- Create: `packages/policy-engine/src/evaluate.ts`
- Create: `packages/policy-engine/src/types.ts`
- Create: `packages/policy-engine/src/index.ts`
- Create: `packages/policy-engine/package.json`
- Create: `packages/policy-engine/tsconfig.json`
- Test: `tests/policy-engine/evaluate.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { evaluatePolicy } from "../../packages/policy-engine/src/evaluate";

describe("evaluatePolicy", () => {
  it("requires approval above the auto-approve limit", () => {
    const result = evaluatePolicy(
      { autoApproveLimit: 50, blockedSellers: [], requiredCertifications: [] },
      { totalAmount: 55, sellerId: "seller_1", certifications: [] }
    );

    expect(result.requiresApproval).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/policy-engine/evaluate.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Implement policy evaluation for:

- auto-approval threshold
- blocked seller checks
- required certification checks
- substitution allowance

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/policy-engine/evaluate.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/policy-engine tests/policy-engine/evaluate.test.ts
git commit -m "feat: add policy evaluation engine"
```

---

### Task 7: Implement Demand Planner

**Files:**
- Create: `packages/demand-planner/src/plan.ts`
- Create: `packages/demand-planner/src/types.ts`
- Create: `packages/demand-planner/src/index.ts`
- Create: `packages/demand-planner/package.json`
- Create: `packages/demand-planner/tsconfig.json`
- Test: `tests/demand-planner/plan.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { planDemand } from "../../packages/demand-planner/src/plan";

describe("planDemand", () => {
  it("creates a replenishment intent when inventory is below threshold", () => {
    const intents = planDemand({
      inventory: [{ sku: "egg-12", quantityOnHand: 2, reorderPoint: 4 }],
      catalogMap: { "egg-12": { category: "eggs", normalizedAttributes: { count: 12 } } }
    });

    expect(intents).toHaveLength(1);
    expect(intents[0]?.category).toBe("eggs");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/demand-planner/plan.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Implement threshold-based replenishment planning with:

- reorder threshold detection
- basic quantity recommendation
- intent construction

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/demand-planner/plan.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/demand-planner tests/demand-planner/plan.test.ts
git commit -m "feat: add demand planning module"
```

---

### Task 8: Implement Seller Protocol Contracts and Adapter Interface

**Files:**
- Create: `packages/seller-protocol/src/messages.ts`
- Create: `packages/seller-protocol/src/port.ts`
- Create: `packages/seller-protocol/src/index.ts`
- Create: `packages/seller-protocol/package.json`
- Create: `packages/seller-protocol/tsconfig.json`
- Test: `tests/contract/seller-protocol.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { RFQSchema } from "../../packages/seller-protocol/src/messages";

describe("seller protocol", () => {
  it("validates an RFQ", () => {
    const value = RFQSchema.parse({
      rfqId: "rfq_1",
      buyerAgentId: "buyer_1",
      category: "eggs",
      quantity: 2
    });

    expect(value.rfqId).toBe("rfq_1");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/contract/seller-protocol.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Implement:

- RFQ schema
- quote schema
- inventory hold schema
- order commit schema
- seller protocol port interface

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/contract/seller-protocol.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/seller-protocol tests/contract/seller-protocol.test.ts
git commit -m "feat: add seller protocol contracts"
```

---

### Task 9: Build Seller Simulator

**Files:**
- Create: `apps/seller-sim/src/server.ts`
- Create: `apps/seller-sim/src/handlers.ts`
- Create: `apps/seller-sim/src/data.ts`
- Create: `apps/seller-sim/package.json`
- Create: `apps/seller-sim/tsconfig.json`
- Create: `tests/helpers/request-quote.ts`
- Test: `tests/integration/seller-sim.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { requestQuote } from "../helpers/request-quote";

describe("seller simulator", () => {
  it("returns a quote for a supported RFQ", async () => {
    const quote = await requestQuote({
      category: "eggs",
      quantity: 2
    });

    expect(quote.items[0]?.quantity).toBe(2);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/integration/seller-sim.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Implement a local Fastify seller simulator with:

- in-memory catalog
- RFQ handler
- quote generation
- inventory hold response

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/integration/seller-sim.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/seller-sim tests/integration/seller-sim.test.ts
git commit -m "feat: add seller simulator"
```

---

### Task 10: Implement Offer Evaluator

**Files:**
- Create: `packages/offer-evaluator/src/score.ts`
- Create: `packages/offer-evaluator/src/index.ts`
- Create: `packages/offer-evaluator/package.json`
- Create: `packages/offer-evaluator/tsconfig.json`
- Test: `tests/offer-evaluator/score.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { rankOffers } from "../../packages/offer-evaluator/src/score";

describe("rankOffers", () => {
  it("prefers policy-compliant faster offers over slightly cheaper risky offers", () => {
    const ranked = rankOffers([
      { sellerId: "fast", totalCost: 30, etaHours: 4, trust: 0.9, policyMatch: 1 },
      { sellerId: "cheap", totalCost: 28, etaHours: 20, trust: 0.3, policyMatch: 0.4 }
    ]);

    expect(ranked[0]?.sellerId).toBe("fast");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/offer-evaluator/score.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Implement a deterministic weighted scoring function and return ranked offers.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/offer-evaluator/score.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/offer-evaluator tests/offer-evaluator/score.test.ts
git commit -m "feat: add offer ranking engine"
```

---

### Task 11: Implement Audit Log Port and In-Memory Memory Store

**Files:**
- Create: `packages/memory/src/store.ts`
- Create: `packages/memory/src/audit-log.ts`
- Create: `packages/memory/src/index.ts`
- Create: `packages/memory/package.json`
- Create: `packages/memory/tsconfig.json`
- Test: `tests/memory/store.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { createMemoryStore } from "../../packages/memory/src/store";

describe("memory store", () => {
  it("persists and returns audit events for an order", () => {
    const store = createMemoryStore();
    store.appendAuditEvent("order_1", { type: "QUOTE_SELECTED" });

    expect(store.getAuditEvents("order_1")).toHaveLength(1);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/memory/store.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Implement:

- in-memory audit event store
- order memory store
- read APIs for explanations

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/memory/store.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/memory tests/memory/store.test.ts
git commit -m "feat: add memory and audit storage"
```

---

### Task 12: Implement Procurement State Machine

**Files:**
- Create: `packages/orchestrator/src/machine.ts`
- Create: `packages/orchestrator/src/types.ts`
- Create: `packages/orchestrator/src/index.ts`
- Create: `packages/orchestrator/package.json`
- Create: `packages/orchestrator/tsconfig.json`
- Test: `tests/orchestrator/machine.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { createProcurementMachine } from "../../packages/orchestrator/src/machine";

describe("procurement machine", () => {
  it("moves from selected offer to payment authorized only after inventory hold", () => {
    const machine = createProcurementMachine();
    let state = machine.initialState;
    state = machine.transition(state, { type: "OFFER_SELECTED" });
    state = machine.transition(state, { type: "INVENTORY_HELD" });

    expect(state.value).toBe("inventoryHeld");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/orchestrator/machine.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Implement the typed state machine for:

- sourcing
- approval wait
- quote collection
- offer selection
- inventory hold
- payment authorization
- commit
- fulfillment start
- exception and retry

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/orchestrator/machine.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/orchestrator tests/orchestrator/machine.test.ts
git commit -m "feat: add procurement state machine"
```

---

### Task 13: Implement Checkout Executor

**Files:**
- Create: `packages/checkout/src/execute.ts`
- Create: `packages/checkout/src/ports.ts`
- Create: `packages/checkout/src/index.ts`
- Create: `packages/checkout/package.json`
- Create: `packages/checkout/tsconfig.json`
- Test: `tests/checkout/execute.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it, vi } from "vitest";
import { executeCheckout } from "../../packages/checkout/src/execute";

describe("executeCheckout", () => {
  it("authorizes payment after inventory hold and returns committed order", async () => {
    const payment = { authorize: vi.fn().mockResolvedValue({ approved: true }) };
    const seller = { commitOrder: vi.fn().mockResolvedValue({ orderId: "order_1" }) };

    const result = await executeCheckout({
      holdConfirmed: true,
      payment,
      seller
    });

    expect(result.orderId).toBe("order_1");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/checkout/execute.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Implement:

- inventory hold precondition
- payment authorization
- commit call
- compensation error path

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/checkout/execute.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/checkout tests/checkout/execute.test.ts
git commit -m "feat: add checkout executor"
```

---

### Task 14: Implement Fulfillment Watcher

**Files:**
- Create: `packages/fulfillment/src/watch.ts`
- Create: `packages/fulfillment/src/index.ts`
- Create: `packages/fulfillment/package.json`
- Create: `packages/fulfillment/tsconfig.json`
- Test: `tests/fulfillment/watch.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { evaluateFulfillmentEvents } from "../../packages/fulfillment/src/watch";

describe("evaluateFulfillmentEvents", () => {
  it("flags a delayed shipment for exception handling", () => {
    const result = evaluateFulfillmentEvents({
      now: "2026-03-23T12:00:00+08:00",
      deadline: "2026-03-23T10:00:00+08:00",
      status: "in_transit"
    });

    expect(result.action).toBe("open_exception");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/fulfillment/watch.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Implement:

- delay detection
- damage event handling
- remediation action suggestion

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/fulfillment/watch.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/fulfillment tests/fulfillment/watch.test.ts
git commit -m "feat: add fulfillment watcher"
```

---

### Task 15: Compose End-to-End Procurement Service

**Files:**
- Create: `packages/orchestrator/src/service.ts`
- Modify: `packages/orchestrator/src/index.ts`
- Test: `tests/integration/procurement-service.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { runProcurementScenario } from "../../packages/orchestrator/src/service";

describe("procurement service", () => {
  it("runs demand to committed order using mocked ports", async () => {
    const result = await runProcurementScenario();
    expect(result.status).toBe("orderCommitted");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/integration/procurement-service.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Wire together:

- demand planner
- policy engine
- seller protocol adapter
- offer evaluator
- checkout executor
- memory store
- orchestrator transitions

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/integration/procurement-service.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/orchestrator tests/integration/procurement-service.test.ts
git commit -m "feat: compose procurement service"
```

---

### Task 16: Add Fastify Buyer API

**Files:**
- Create: `apps/api/src/server.ts`
- Create: `apps/api/src/routes/intents.ts`
- Create: `apps/api/src/routes/orders.ts`
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Test: `tests/integration/api.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { buildServer } from "../../apps/api/src/server";

describe("buyer api", () => {
  it("returns an explanation for a known order", async () => {
    const app = buildServer();
    const response = await app.inject({
      method: "GET",
      url: "/orders/order_1/explanation"
    });

    expect(response.statusCode).toBe(200);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/integration/api.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Implement:

- `POST /intents/replenish`
- `GET /orders/:id`
- `GET /orders/:id/explanation`

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/integration/api.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api tests/integration/api.test.ts
git commit -m "feat: add buyer api surface"
```

---

### Task 17: Add Architecture Guard Tests

**Files:**
- Create: `tests/architecture/guardrails.test.ts`
- Create: `tests/helpers/architecture-guards.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { canModuleAccessPayment } from "../helpers/architecture-guards";

describe("architecture guardrails", () => {
  it("prevents llm-facing modules from directly using payment ports", () => {
    expect(canModuleAccessPayment("negotiation-agent")).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/architecture/guardrails.test.ts`
Expected: FAIL because helper and rules do not exist

**Step 3: Write minimal implementation**

Add architecture guard helpers and assertions to verify:

- only checkout can call payment port
- only orchestrator changes order states
- committed orders emit audit events

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/architecture/guardrails.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/architecture
git commit -m "test: add architecture guardrails"
```

---

### Task 18: Add End-to-End Happy Path and Failure Path

**Files:**
- Create: `tests/e2e/replenishment-happy-path.test.ts`
- Create: `tests/e2e/inventory-hold-failure.test.ts`
- Create: `tests/fixtures/happy-path-scenario.ts`
- Create: `tests/fixtures/inventory-hold-failure-scenario.ts`

**Step 1: Write the failing test**

Create:

- one full happy path test
- one inventory hold failure recovery test

Each test should drive the public service or API rather than internal helpers.

**Step 2: Run test to verify they fail**

Run: `pnpm vitest run tests/e2e`
Expected: FAIL

**Step 3: Write minimal implementation**

Fill missing glue for:

- scenario fixtures
- seller simulator startup
- recovery path behavior
- explanation data for both paths

**Step 4: Run test to verify they pass**

Run: `pnpm vitest run tests/e2e`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/e2e
git commit -m "test: add end-to-end procurement scenarios"
```

---

### Task 19: Produce Implementation Review and Code Review Checklist

**Files:**
- Create: `docs/reviews/2026-03-22-openclaw-native-commerce-code-review.md`
- Create: `docs/reviews/2026-03-22-openclaw-native-commerce-review-checklist.md`

**Step 1: Write the failing test**

No code test. Define checklist items for:

- correctness
- safety boundaries
- missing tests
- overbuilding
- coupling

**Step 2: Verify absence**

Run: `test -f docs/reviews/2026-03-22-openclaw-native-commerce-code-review.md`
Expected: exit code 1

**Step 3: Write minimal implementation**

Create:

- review template
- reviewer checklist

**Step 4: Verify they exist**

Run: `test -f docs/reviews/2026-03-22-openclaw-native-commerce-code-review.md && test -f docs/reviews/2026-03-22-openclaw-native-commerce-review-checklist.md`
Expected: exit code 0

**Step 5: Commit**

```bash
git add docs/reviews
git commit -m "docs: add review templates"
```

---

### Task 20: Produce Architecture Conformance Report

**Files:**
- Create: `docs/reviews/2026-03-22-openclaw-native-commerce-architecture-conformance.md`

**Step 1: Write the failing test**

No code test. Define a matrix with one row per module and these columns:

- designed responsibility
- implemented responsibility
- match status
- deviation
- follow-up action

**Step 2: Verify absence**

Run: `test -f docs/reviews/2026-03-22-openclaw-native-commerce-architecture-conformance.md`
Expected: exit code 1

**Step 3: Write minimal implementation**

Create a conformance report template referencing the design document and implementation artifacts.

**Step 4: Verify it exists**

Run: `test -f docs/reviews/2026-03-22-openclaw-native-commerce-architecture-conformance.md`
Expected: exit code 0

**Step 5: Commit**

```bash
git add docs/reviews/2026-03-22-openclaw-native-commerce-architecture-conformance.md
git commit -m "docs: add architecture conformance report template"
```

---

### Task 21: Run Full Verification Suite

**Files:**
- Modify: `package.json`
- Create: `scripts/verify.sh`

**Step 1: Write the failing test**

Add a root script expectation:

- `pnpm verify` should run lint, typecheck, unit, integration, e2e tests

**Step 2: Run command to verify it fails**

Run: `pnpm verify`
Expected: FAIL because script is not defined

**Step 3: Write minimal implementation**

Implement:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm verify`
- `scripts/verify.sh`

**Step 4: Run command to verify it passes**

Run: `pnpm verify`
Expected: PASS

**Step 5: Commit**

```bash
git add package.json scripts/verify.sh
git commit -m "chore: add verification workflow"
```

---

## Subagent Execution Map

When execution starts, dispatch tasks in this order:

1. Task 1
2. Task 2
3. Task 3
4. Task 4
5. Task 5
6. Task 6
7. Task 7
8. Task 8
9. Task 9
10. Task 10
11. Task 11
12. Task 12
13. Task 13
14. Task 14
15. Task 15
16. Task 16
17. Task 17
18. Task 18
19. Task 19
20. Task 20
21. Task 21

Safe parallelization candidates after the foundation is stable:

- Task 5 and Task 6
- Task 10 and Task 11
- Task 19 and Task 20

Do not parallelize:

- Task 12 through Task 18

Those tasks share orchestration and integration files.

---

## Review Protocol During Execution

For every implementation task:

1. Implementer subagent writes tests and minimal code.
2. Spec reviewer checks exact compliance with the task.
3. Code-quality reviewer checks correctness, coupling, naming, and overbuilding.
4. Controller reruns the task tests locally.
5. Only then continue.

At the end:

1. Run full verification suite.
2. Produce code review findings.
3. Fill architecture conformance report against `docs/plans/2026-03-22-openclaw-native-commerce-design.md`.
4. Record all intentional deviations.

---

## Definition of Done

The implementation is complete only when:

- all tasks are complete
- `pnpm verify` passes
- the happy path and failure path both pass end-to-end
- code review has no unresolved critical findings
- architecture conformance report is filled in
- deviations from the design are documented and justified
