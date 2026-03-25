# OpenClaw Web Demo Product Design

## Summary

This feature adds a standalone local web application that demonstrates OpenClaw as an agent-native replenishment product. The default landing experience is a household fridge replenishment flow, with a second workspace for office and store replenishment.

The web app is not a mock marketing page. It must drive the existing buyer API and seller simulator so users can see a real replenishment run, the selected quote, the policy result, and the order explanation trail.

## Product Goal

Deliver a complete, directly runnable product demo that lets a user:

- see inventory pressure in a household fridge scenario
- trigger a replenishment run with one click
- watch the procurement state progress through a visible flow
- inspect why the agent selected a seller and whether approval was required
- switch to an office replenishment scenario and compare the behavior

## Non-Goals

- real authentication
- real payments
- persistent multi-user storage
- a production marketplace frontend
- general browsing and search across large catalogs

## Primary User Experience

### Default Experience: Household Fridge Replenishment

The landing page should feel like a personal procurement cockpit rather than a developer console. The first screen shows a household inventory snapshot, highlights shortages, and frames the user action as "let the agent restock this home."

The primary call to action triggers a replenishment run for items such as eggs, milk, paper towels, and pet food. Results are rendered in-place as a timeline and order summary rather than dumped as raw JSON.

### Secondary Experience: Office / Store Replenishment

Users can switch to an office-style workspace that emphasizes policy, spend controls, and predictable operations. The visuals and copy remain part of the same product, but the underlying scenario data changes to office items such as coffee beans, bottled water, and cleaning supplies.

### Inspection Mode

The product keeps an explanation drawer for auditability. By default it stays secondary. When opened, it exposes the explanation event list, the stored snapshot, and the key selected quote details. This gives a user-facing product demo and a testable debugging surface at the same time.

## Information Architecture

The app is organized into four major regions.

### 1. Hero and Scenario Switcher

- headline and framing for agent-native replenishment
- scenario tabs for `home` and `office`
- primary CTA to run replenishment
- secondary CTA to view explanation details

### 2. Inventory Pressure Panel

- scenario-specific inventory cards
- current stock, reorder point, and recommended action
- a compact policy summary so users understand why the agent is allowed to act

### 3. Procurement Flow Visualization

- intent created
- quote selected
- policy evaluated
- approval required or inventory held
- payment authorized
- order committed or retry

This region is the product centerpiece. It should read like a coherent flow, not like logs in a table.

### 4. Order Summary and Explanation Drawer

- selected seller
- total amount
- order status
- explanation events
- order snapshot JSON for validation and debugging

## Visual Direction

The interface should look like a domestic operations room rather than a default SaaS dashboard. The visual direction is:

- warm daylight palette with olive, cream, rust, and charcoal accents
- expressive editorial typography, avoiding default system aesthetics
- layered cards, soft gradients, and subtle patterning for atmosphere
- clear mobile and desktop layouts

The office view should inherit the same product language but shift its emphasis toward operational precision and spend governance.

## System Architecture

## Frontend

Add a new standalone app at `apps/web`.

Responsibilities:

- render the household-first product experience
- switch between home and office scenarios
- call the buyer API to trigger replenishment runs
- fetch order snapshots and explanations
- render graceful empty, loading, retry, and backend-unavailable states

Recommended structure:

- `apps/web/src/app/*` for shell, state, and layout
- `apps/web/src/components/*` for product-facing UI pieces
- `apps/web/src/lib/api.ts` for buyer API access
- `apps/web/src/lib/scenarios.ts` for local scenario presentation data

## Backend

The existing buyer API already exposes replenishment and order lookup routes, but it only runs a single hard-coded scenario. The demo product needs parameterized inputs so the UI can demonstrate distinct behavior without forking the backend.

Required backend changes:

- allow `POST /intents/replenish` to accept a scenario identifier
- allow demo fixture overrides for approval-required and hold-failure states
- return enough metadata for the frontend to present a meaningful order summary

The seller simulator can remain simple. It only needs to keep supporting RFQ, hold, and commit flows.

## Demo Data Model

The frontend needs local presentation metadata for each scenario:

- scenario id
- title and explanatory copy
- inventory cards
- policy summary
- replenishment CTA label

The backend needs a deterministic mapping from scenario id to fixture inputs:

- home inventory and policy defaults
- office inventory and policy defaults
- optional approval threshold override
- optional hold failure override

## Error Handling

Errors are part of the product story, not just exceptions.

- if the API is offline, show a "backend not running" state with launch guidance
- if approval is required, present that as a controlled policy outcome
- if inventory hold fails, present it as an operational retry path
- keep raw details inside the explanation drawer, not in the hero surface

## Testing Strategy

The product must ship with three layers of verification.

### Unit and Component Tests

- scenario switching
- inventory pressure rendering
- flow timeline status rendering
- explanation drawer state

### Integration Tests

- buyer API accepts scenario payloads
- order summary data matches stored snapshots
- approval-required and hold-failure branches remain reachable

### Browser E2E

- open the web app
- run the default household replenishment flow
- inspect explanation details
- switch to office scenario
- verify user-visible error handling when the API is unavailable

## Acceptance Criteria

The feature is complete when:

- `pnpm start:web` launches a real browser-testable product
- the homepage defaults to household fridge replenishment
- the office scenario is reachable in the same app
- the UI is driven by the buyer API, not hard-coded fake success state
- the full verification suite passes from the feature branch
- final review documents compare implementation to this design
