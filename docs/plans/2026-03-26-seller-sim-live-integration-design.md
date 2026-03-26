# OpenClaw Seller-Sim Live Integration Design

## Goal

Make the Web Validation Console `Live` mode use a real `buyer API -> seller-sim` replenishment path instead of probing seller-sim for health while the buyer API continues to use the in-memory seller adapter.

## Why This Change

The repo already has a real seller protocol surface:

- `apps/seller-sim` exposes `/rfq`, `/quotes/:quoteId/hold`, and `/orders/commit`
- test helpers already know how to adapt that HTTP surface into a `SellerProtocolPort`
- end-to-end tests already prove the orchestrator can run against a seller port when one is injected manually

What is missing is runtime wiring. The buyer API still calls `runProcurementScenario()` without a real seller port, so the default Live path is only partially real.

## Architecture

### 1. Seller Protocol Adapter

Add a production runtime HTTP adapter for `SellerProtocolPort`.

Responsibilities:

- accept a `baseUrl` and optional `fetch`
- map `requestQuote()` to `POST /rfq`
- map `holdInventory()` to `POST /quotes/:quoteId/hold`
- map `commitOrder()` to `POST /orders/commit`
- parse all responses through the shared seller protocol schemas
- throw explicit errors when seller-sim returns a non-2xx response

This keeps the orchestrator ignorant of transport details.

### 2. Buyer API Runtime Wiring

Update the buyer API startup and route wiring so the default replenishment path uses the HTTP seller adapter.

Behavior:

- read `SELLER_SIM_BASE_URL`, defaulting to `http://127.0.0.1:3100`
- construct one runtime seller port during API startup
- inject that seller port into `registerIntentRoutes()`
- pass the seller port into `runProcurementScenario()`

This makes the default API path:

`buyer API -> orchestrator -> HTTP seller port -> seller-sim`

No silent fallback should remain in the buyer API runtime path. If seller-sim is unavailable, the Live request should fail clearly.

### 3. Web Live Meaning

The Web app can keep its existing API shape:

- `POST /api/live/intents/replenish`
- `GET /api/live/orders/:id/explanation`

But the meaning changes:

- seller quote now comes from real seller-sim
- inventory hold now comes from real seller-sim
- order commit now comes from real seller-sim

The UI does not need a structural rewrite. It only needs slightly more accurate step copy and docs so the investor walkthrough matches reality.

## Data Flow

1. Web `Live` probes buyer API and seller-sim health as before.
2. User clicks `开始演示`.
3. Web calls `POST /api/live/intents/replenish`.
4. Buyer API creates an RFQ and calls seller-sim through the HTTP seller port.
5. Seller-sim returns quote, hold, and commit data.
6. Buyer API stores audit events and the final order snapshot.
7. Web calls `GET /api/live/orders/:id/explanation`.
8. Web renders the same timeline, but it now represents a real seller-sim-backed path.

## Error Handling

- If seller-sim is unavailable, the buyer API request should fail instead of falling back to an in-memory seller.
- The Web page should keep the current behavior: surface the failure through runtime health and fall back to `Demo`.
- The runtime error should still mention which service failed so the fallback copy remains actionable.

## Testing Strategy

### Protocol Adapter Tests

Add a focused unit/integration test for the new HTTP seller port:

- quote request succeeds
- hold request succeeds
- commit request succeeds
- non-2xx seller response throws a stable error

### Buyer API Integration Tests

Run the real buyer API against a real seller-sim server:

- `POST /intents/replenish` succeeds when seller-sim is available
- explanation trail includes seller-backed events like `QUOTE_SELECTED`, `INVENTORY_HELD`, and `ORDER_COMMITTED`
- request fails when seller-sim is unavailable

### Web Tests

Keep the current Web Live smoke test and update copy/documentation expectations so it accurately says seller-sim is part of the real replenishment path.

## Boundaries

This design does not add:

- multi-seller discovery
- runtime fallback from real seller-sim to in-memory seller
- persistent storage
- a new Web timeline structure

## Implementation Sequence

1. Introduce the production HTTP seller protocol adapter with failing tests first.
2. Wire the buyer API to use the adapter through `SELLER_SIM_BASE_URL`.
3. Add buyer API integration coverage for seller-sim success and failure.
4. Update Web copy and docs to reflect the true Live path.
5. Re-run full build, unit, integration, and e2e verification.
