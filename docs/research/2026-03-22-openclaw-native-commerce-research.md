# OpenClaw Native Commerce Research Notes

Checklist:

- [x] Domain assumptions
- [x] MVP boundaries
- [x] Open protocol questions
- [x] Target vertical recommendation

## Recommendation

Start with office and small-business replenishment, not consumer grocery. The first vertical should be standardized, high-frequency, and low-emotion: paper goods, coffee, cleaning supplies, pantry staples, and similar repeat orders. This gives the buyer agent a clear ROI story, a narrow policy surface, and sellers that can tolerate structured RFQ and recurring automation.

## Domain Assumptions

- Demand sensing can begin from order history, simple stock thresholds, scheduled replenishment, and manual user signals.
- Full IoT inventory sensing is not required for MVP.
- The buyer agent must encode user policy as explicit constraints: budget caps, preferred brands, delivery windows, and approval thresholds.
- Autonomous purchase is acceptable only inside those policy bounds.
- Seller-side automation is more valuable than free-form chat; sellers need machine-readable catalog and quote support first.

## MVP Boundaries

- Support a small, curated supplier set before any open marketplace onboarding.
- Keep negotiation bounded: ask for quote, counteroffer, inventory hold, and commit.
- Use a deterministic orchestrator for all state transitions.
- Keep payment and logistics behind adapters; do not build those rails in MVP.
- Prefer repeatable replenishment over complex discovery or one-off shopping.

## Open Protocol Questions

- What is the minimum canonical product schema that still supports substitution across sellers?
- How should quote TTL, inventory lock, and commit semantics be represented so agents do not race each other?
- What identity and reputation signals are required before a seller agent can be trusted for auto-commit?
- Which events must be signed and auditable for dispute resolution?
- Where should payment authorization stop and irreversible settlement begin?

## Unresolved Risks

- Consumer grocery is more attractive narratively, but it adds freshness risk, substitution complexity, and higher trust requirements too early.
- Fully open seller onboarding will magnify fraud and schema inconsistency before the buyer agent is reliable.
- Free-form negotiation is too ambiguous for the first implementation; structured protocol should come first.
