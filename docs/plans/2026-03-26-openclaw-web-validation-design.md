# OpenClaw Web Validation Console Design

**Document Date:** 2026-03-26

**Status:** Proposed

**Objective:** Add a single-page Web application that can explain and demonstrate the OpenClaw shopping-agent flow for investors and partners, while still being usable by the internal team as a verification surface.

## 1. Product Goal

The Web page is not a marketing site and not a browser-extension replacement.

It should answer three questions in under a minute:

- what OpenClaw does
- how the decision chain works
- whether the system is actually runnable

The page should support two modes:

- `Demo`: deterministic, stable, presentation-safe
- `Live`: connected to the local buyer API and seller simulator

## 2. Primary User

Primary user:

- investor or partner seeing an interactive product walkthrough

Secondary user:

- internal operator validating that the end-to-end chain still behaves correctly

## 3. Recommended Shape

Use a single-page Web application in `apps/web`.

Recommended experience:

- product-facing hero and framing at the top
- scenario-driven interactive walkthrough in the middle
- operational status and runtime controls on the side or bottom

This should feel like a `showroom + control room`, with the interaction model centered around running a complete scenario rather than manually poking isolated forms.

## 4. Page Structure

### 4.1 Hero

Purpose:

- establish the thesis immediately

Suggested copy direction:

- "OpenClaw does not help users browse. It completes consumption decisions."

Key UI:

- product thesis
- one primary call to action
- compact trust strip showing `Demo`, `Live`, and system status

### 4.2 Scenario Picker

Purpose:

- give the presenter a stable entry point

Initial scenarios:

- replenishment of a daily-use item
- cart threshold optimization
- seller/ETA tradeoff

Each scenario should show:

- title
- one-sentence business value
- tags such as `budget`, `ETA`, `auto-buy`, `approval`

### 4.3 Flow Timeline

Purpose:

- visualize the chain as a sequence of machine decisions

Planned steps:

- Demand
- Decision
- Cart Plan
- Seller / Order
- Explanation

Each step should support:

- a compact headline
- success/error/loading status
- expandable structured detail

### 4.4 Explanation Panel

Purpose:

- show why the result happened

Content:

- rule hits
- selected mode
- seller / price / ETA rationale
- approval requirement or auto-pass explanation

### 4.5 Ops Dock

Purpose:

- prove the system can run, not just animate

Content:

- `Demo / Live` toggle
- buyer API status
- seller simulator status
- latest run state
- rerun action

## 5. Technical Architecture

## 5.1 New App

Create `apps/web` as a Vite + React + TypeScript app.

The Web app should remain independent from Chrome-extension APIs. It must run in a normal browser without requiring extension context.

## 5.2 Shared View Model

Both `Demo` and `Live` mode should normalize into the same render model.

Suggested root model:

- `scenarioId`
- `runtime`
- `mode`
- `summary`
- `steps`
- `signals`
- `health`

UI components should render only this model and not branch deeply on data source.

## 5.3 Runtime Adapter Boundary

Define one runtime interface with two implementations:

- `DemoRuntimeAdapter`
- `LiveRuntimeAdapter`

### DemoRuntimeAdapter

Responsibilities:

- serve stable, pre-authored scenario results
- simulate end-to-end status transitions
- never depend on local backend availability

### LiveRuntimeAdapter

Responsibilities:

- probe API and seller-sim health
- call the local buyer API for live scenario execution
- fetch explanation data for the returned order
- map live responses into the shared render model

## 5.4 Local Service Integration

The current buyer API already exposes:

- `POST /intents/replenish`
- `GET /orders/:id`
- `GET /orders/:id/explanation`

The seller simulator currently exposes RFQ, hold, and commit endpoints but does not expose a health endpoint.

To support a trustworthy `Ops Dock`, add simple `GET /health` endpoints to:

- buyer API
- seller simulator

The Web app should never assume services are online. `Live` mode must degrade to clear error or fallback UI.

## 6. Interaction Model

Default state:

- page loads in `Demo`
- first scenario preselected
- hero visible

Primary happy path:

1. user clicks `开始演示`
2. page scrolls to the scenario section
3. scenario runs
4. timeline reveals step-by-step
5. user expands details or switches to `Live`

Failure path:

- if `Live` services are unavailable, show service health failure clearly and keep `Demo` usable

## 7. Design Language

The page should not look like a generic SaaS dashboard and should not lean on default AI purple aesthetics.

Desired mood:

- warm
- credible
- operational

Suggested direction:

- warm sand / amber / deep brown base
- restrained green or blue only for confirmed states
- large, crisp cards
- visible but not flashy timeline transitions

The system should feel like a decision machine, not a chatbot.

## 8. MVP Boundary

### In Scope

- single-page app
- three preset scenarios
- `Demo / Live` runtime switching
- five-step decision timeline
- explanation panel
- API / seller-sim health display
- live invocation of the current buyer API

### Out of Scope

- login
- persistence layer for the Web app
- direct extension-to-web communication
- production analytics
- deployment pipeline
- multi-page navigation

## 9. Verification Strategy

The Web app should be validated at three levels:

- unit tests for runtime mapping and pure transforms
- React rendering tests for the single-page shell
- Playwright browser test for the demo page and a live-mode smoke path against local services

The goal is not just to check rendering. It is to prove:

- the story is legible
- the runtime switch works
- the local services can be surfaced as a working chain

## 10. Key Risks

- live mode may look broken if services are down, so the fallback copy and health UI must be explicit
- the page can easily drift into either a boring operator console or a fake investor animation; the implementation should keep both operational and presentational value
- if demo and live mode produce different shapes, the UI will split into two apps; the shared view model prevents this

## 11. Recommendation

Build `apps/web` as a single-page validation console first.

Do not start with routing, auth, or database-backed state. The first milestone should be a stable `Demo` flow with a working `Live` toggle that can call the local buyer API and display the explanation trail.
