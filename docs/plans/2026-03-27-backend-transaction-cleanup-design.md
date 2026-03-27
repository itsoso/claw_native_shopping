# Backend Transaction Cleanup Design

## Goal

Clean up the backend transaction chain so the `buyer API -> orchestrator -> seller protocol -> seller-sim` Live path stays behaviorally identical while the runtime wiring, HTTP protocol adapters, and orchestration helpers become easier to reason about and extend.

## Current Problems

The real Live chain works, but three code smells are now accumulating in the critical path:

- `apps/api/src/server.ts` mixes Fastify bootstrapping with seller runtime dependency resolution
- `packages/orchestrator/src/service.ts` owns too many concerns at once: default fixture setup, seller adaptation, audit writes, snapshot building, and the actual transaction flow
- `packages/seller-protocol/src/httpPort.ts` and `packages/seller-protocol/src/httpQuoteCollector.ts` duplicate URL construction, fetch wiring, and HTTP error handling

These are not correctness bugs today, but they make the next rounds of seller integration and policy changes riskier than they need to be.

## Chosen Approach

Do a boundary-cleanup refactor, not a pipeline rewrite.

### Why this approach

- it improves maintainability without changing the Live system semantics
- it keeps the real seller-sim runtime path intact
- it contains the work to the backend transaction path instead of widening into web or extension changes

## Architecture

### 1. API Runtime Resolution

Extract seller runtime dependency resolution out of `buildServer()` into a dedicated helper inside `apps/api`.

The helper will resolve a single runtime object:

- `sellerBaseUrl`
- `sellerPort`
- `quoteCollector`

This keeps the Fastify server factory focused on server construction and makes the seller dependency rules testable in isolation.

### 2. Shared Seller HTTP Client Helpers

Create a small shared helper layer inside `packages/seller-protocol` for:

- building seller URLs from a base URL plus path
- issuing JSON POST requests
- parsing non-2xx responses into consistent seller request errors

`httpPort.ts` and `httpQuoteCollector.ts` will both consume these helpers so the HTTP protocol behavior stays consistent.

### 3. Orchestrator Service Helper Extraction

Keep `runProcurementScenario()` as the public entrypoint, but move non-core orchestration logic into helpers:

- default planning input creation
- default in-memory seller adapter creation
- seller runtime resolution for the scenario fixture
- request metadata context creation
- ranked offer context creation
- retry / approval / committed result builders

After refactor, the top-level function should read as the transaction narrative:

1. resolve planning context
2. create intent and RFQ
3. collect and select quote
4. evaluate policy
5. hold inventory
6. commit checkout
7. persist snapshot and return result

## Boundaries

This refactor does not:

- change the Live request schema
- change seller-sim endpoints
- change Web validation console behavior
- replace the procurement machine with a new orchestration engine
- remove the default in-memory fallback used by tests and fixtures

## Testing

### Seller Protocol

- add focused tests for the shared HTTP helper behavior
- keep existing HTTP port and quote collector integration behavior green

### API Runtime Wiring

- add coverage for seller runtime resolution rules
- verify explicit injected ports do not accidentally create conflicting runtime helpers
- verify the default seller base URL still resolves correctly

### Orchestrator

- keep committed, approval-required, and inventory-hold-failed paths covered
- keep ranked offer context in audit trail and snapshot covered
- confirm the real integration path still uses seller-sim and commits successfully
