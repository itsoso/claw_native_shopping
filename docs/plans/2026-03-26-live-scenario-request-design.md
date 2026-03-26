# OpenClaw Live Scenario Request Design

## Goal

Make the Web Validation Console `Live` mode send the selected scenario and decision mode to the buyer API, and make that input change the real backend replenishment request instead of only changing presentation copy.

## Problem

The Web console already lets the user choose:

- `补货日常洗衣液`
- `优化购物车满减门槛`
- `卖家时效与价格权衡`

and switch between:

- `更省时间`
- `更稳妥`
- `更划算`

But today those selections mostly affect the summary text around the Live flow. The buyer API still uses one fixed replenishment input.

## Design

### 1. Shared Live Request Contract

Add a small shared contract for Live replenishment requests:

- `scenarioId`
- `mode`

This contract should be used by both the Web runtime and the buyer API route parser.

### 2. Scenario Profiles In The Orchestrator Layer

Introduce a small mapping layer that turns `(scenarioId, mode)` into procurement inputs:

- inventory SKU and reorder point
- category
- budget limit
- delivery window target
- optional policy tuning

This keeps the route thin and avoids hard-coding all scenario logic inside `apps/api`.

### 3. Runtime Request Flow

The Web Live flow changes from:

- `POST /intents/replenish` with no body

to:

- `POST /intents/replenish` with `{ scenarioId, mode }`

The buyer API will parse the request, build the matching procurement profile, and pass it into `runProcurementScenario()`.

### 4. Observable Effects

To prove the request really changed backend behavior, the resulting explanation and snapshot should carry enough context to show:

- selected scenario
- selected mode
- requested category
- requested quantity
- budget limit or other planning defaults that changed

The Web timeline can stay structurally the same, but its step copy should become more specific by using those returned values.

## Scope

This change should not add:

- dynamic seller discovery
- multiple simultaneous seller quotes
- new pages or routes
- persistent user profiles

It should only make the existing Live flow genuinely scenario-aware.

## Testing

- contract test for the shared Live request schema
- Web runtime test proving the POST body includes `scenarioId` and `mode`
- buyer API integration test proving different scenarios/modes produce different snapshot values
- existing Web console smoke test should stay green

## Success Criteria

After this change:

- choosing a different scenario or mode changes the real Live request body
- the buyer API uses that input to build different replenishment parameters
- the explanation/snapshot returned to the Web app reflects the chosen scenario and mode
- the UI still degrades safely when Live fails
