# OpenClaw Live Multi-Seller Offer Design

## Goal

Make the real Live replenishment path evaluate multiple seller quotes from `seller-sim` and choose one with the existing `offer-evaluator`, instead of treating seller-sim as a single fixed seller.

## Current Gap

The repo now has:

- real `buyer API -> seller-sim` runtime wiring
- scenario-aware Live request bodies
- seller-sim-backed quote, hold, and commit

But quote selection is still effectively fixed because seller-sim returns one quote for each RFQ.

## Chosen Approach

Add a separate multi-offer endpoint to seller-sim and keep the existing seller protocol intact.

### Why this approach

- it preserves the current `SellerProtocolPort` for hold and commit
- it lets buyer API fetch and rank multiple candidates before selecting one
- it avoids breaking existing tests that only need a single quote

## Architecture

### 1. Seller-Sim Candidate Quote Endpoint

Extend seller-sim with a new endpoint:

- `POST /rfq/options`

Input:

- same RFQ payload as `POST /rfq`

Output:

- array of `QuoteSchema` objects, each representing a different virtual seller offer

Seller-sim will maintain multiple virtual seller profiles per category:

- different unit prices
- different shipping fees
- different delivery ETAs
- different trust/policy metadata inside `serviceTerms`

### 2. Buyer API Quote Collection

Add a small runtime quote collector that:

- calls `POST /rfq/options`
- maps the returned quotes into `OfferCandidate` values
- ranks them through `rankOffers`
- returns the best quote plus the ranked candidate list

The existing hold and commit flow still uses the chosen quote through the normal seller protocol methods.

### 3. Orchestrator Integration

Extend `runProcurementScenario()` so it can optionally use a quote collection result:

- if a quote collector exists, fetch quote candidates and rank them
- append an audit event describing the selection
- continue with hold/commit using the selected quote
- if no quote collector is provided, preserve the current single-quote path

This keeps older tests and helper ports compatible.

### 4. Observable Output

The returned explanation/snapshot should include enough evidence that a real ranking happened:

- selected seller id
- ranked candidate count
- top offer score summary or chosen rationale

The Web Live timeline can then say the buyer API compared real seller-sim candidates before choosing the quote it held and committed.

## Boundaries

This design does not add:

- true distributed multiple seller services
- asynchronous bidding
- dynamic seller registration
- marketplace-wide search

The system still uses one seller-sim service with virtual sellers behind it.

## Testing

- seller-sim integration test for `POST /rfq/options`
- quote collector test proving multi-offer ranking picks the expected seller
- buyer API integration test proving explanation/snapshot show ranked offer selection
- Web Live runtime test proving the step copy reflects multi-offer choice
- existing E2E remains green
