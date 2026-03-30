# OpenClaw Release V1 Design

**Document Date:** 2026-03-29

**Status:** Proposed and executing

**Objective:** Turn the current Web validation branch into a stable, local-first release candidate that a Chinese-speaking potential user can run, understand, and share after one guided household replenishment experience.

## 1. Product Definition

### 1.1 Release Thesis

OpenClaw V1 is not a marketplace, not a browser extension launch, and not a real payment product.

It is a publishable, local-first product experience that demonstrates how an agent can complete a household replenishment decision end-to-end, explain the decision chain, and collect both product feedback and follow-up interest.

### 1.2 Primary Audience

Primary audience:

- potential end users evaluating whether they would trust an AI agent to handle household replenishment

Secondary audience:

- collaborators, early design partners, or technical peers reviewing system credibility

### 1.3 Product Goal

The release should let a first-time visitor do three things in one session:

1. understand what OpenClaw does
2. experience one complete replenishment flow
3. leave feedback or an email address for follow-up

## 2. Product Scope

### 2.1 In Scope

- Chinese-first Web experience
- household replenishment as the main story
- office procurement as a secondary scenario
- deterministic demo flow as the default runtime
- optional live/runtime health for operator use, not the main user path
- working feedback submission
- working email capture
- one-command local startup and one-command release verification

### 2.2 Out of Scope

- real payment
- real marketplace publishing
- multi-user auth
- production analytics stack
- cloud deployment pipeline
- browser extension as part of the release bar

## 3. Product Shape

### 3.1 Primary Surface

The release surface is `apps/web`.

The buyer API and seller simulator remain supporting services. They exist to power the product and to preserve architectural credibility, but the release is judged by the Web product experience.

### 3.2 Narrative

The product story should be:

- "Your household agent noticed a replenishment need"
- "It compared options and enforced your rules"
- "It can explain why it would buy this"
- "You can react, leave feedback, or ask to join future access"

The product story should not be:

- "Here is an operator console"
- "Here is a browser tool"
- "Here is a raw system validation dashboard"

### 3.3 Interaction Model

Default user path:

1. land on a warm, product-facing home screen
2. see household replenishment selected by default
3. start the guided run
4. watch the decision timeline complete
5. inspect the explanation
6. submit feedback
7. optionally leave email for follow-up

Secondary user path:

- switch scenario to office procurement
- inspect health/runtime details
- rerun the flow in live-backed mode if services are online

## 4. UX Structure

### 4.1 Hero

The hero must explain the thesis in plain Chinese:

- OpenClaw is an agent that handles replenishment decisions
- it is not search-first, cart-first, or chat-first
- it applies rules, compares offers, and explains decisions

Primary CTA:

- start the demo flow

Secondary CTA:

- see how the decision was made

### 4.2 Scenario Section

The scenario section should support two choices:

- household replenishment
- office procurement

Household remains the default. Office exists to show breadth, not to dilute the main narrative.

### 4.3 Decision Timeline

The timeline should show a human-readable decision chain:

- Demand detected
- Policy checked
- Offer selected
- Order path determined
- Explanation ready

The copy should remain user-facing, not internal-engineering-facing.

### 4.4 Trust and Explanation

Explanation should emphasize:

- what rule mattered
- why this option won
- what tradeoff was made
- what would need user approval in a real system

### 4.5 Feedback and Email Capture

After the run completes, the user should be able to:

- submit quick structured feedback
- leave an email address for follow-up

These actions must actually persist locally so the product is real, not fake.

## 5. Technical Architecture

### 5.1 Release Architecture

Release V1 uses:

- `apps/web` as the main UI
- `apps/api` as the product and intake backend
- `apps/seller-sim` as the local seller runtime
- domain packages for demand planning, policy evaluation, offer evaluation, orchestration, checkout, and fulfillment

### 5.2 Runtime Modes

Two runtime modes remain, but only one is public-facing by default:

- `Demo`: default, stable, presentation-safe
- `Live`: available as an operator/advanced mode when local services are healthy

The user should not need Live mode to believe the product. Live mode is evidence, not the main interaction path.

### 5.3 Release Data Intake

Add simple local-first intake endpoints to `apps/api`:

- `POST /intake/feedback`
- `POST /intake/interest`

Persistence should be lightweight and file-backed, for example JSONL in a local data directory ignored by git.

This keeps V1 real without introducing external infrastructure.

### 5.4 Verification Boundary

Release verification should center on the release surface, not the legacy extension surface.

That means:

- a release-specific typecheck target
- release-focused unit and integration tests
- Playwright coverage for the release Web flow
- extension code remains in the repository but does not block V1 release

### 5.5 One-Command Operations

V1 must ship with simple operator commands:

- one command to start the release stack locally
- one command to verify the release stack

The repo should not require a reader to manually orchestrate API, seller simulator, and Web preview separately.

## 6. Engineering Priorities

### 6.1 Highest Priority

- make the release path green
- make the release path understandable
- make the release path deterministic

### 6.2 Second Priority

- make the live/runtime path credible and safely optional

### 6.3 Lowest Priority

- preserve full extension verification
- support investor-facing presentation extras

## 7. Main Risks and Decisions

### 7.1 Legacy Scope Risk

The repository currently mixes:

- old extension MVP
- new Web validation product
- internal validation/test harnesses

The release must draw a strict boundary instead of trying to make every historical surface equally healthy.

### 7.2 Fake CTA Risk

If feedback and email capture are only decorative, the product will feel unfinished.

Decision:

- make both local-first and real

### 7.3 Stability Risk

The current baseline already shows that the release branch is not green under the top-level verification command.

Decision:

- harden the release path first
- move non-release surfaces behind explicit legacy or secondary verification gates

## 8. Release Criteria

V1 is release-ready when all of the following are true:

- `pnpm start:release` starts the local experience cleanly
- the Web app defaults to the household scenario
- the end-to-end demo flow completes without operator intervention
- feedback submission works
- email capture works
- release verification passes
- README and release docs match shipped behavior

## 9. Verification Strategy

Release verification should cover:

- API contract tests for intake endpoints
- Web rendering and interaction tests
- end-to-end Playwright checks for the household demo path
- smoke checks for live mode degradation and health visibility

The verification goal is confidence in the release product, not exhaustive validation of every historical module in the monorepo.
