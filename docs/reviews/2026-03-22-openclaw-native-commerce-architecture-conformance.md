# OpenClaw Native Commerce Architecture Conformance

Reference design:
- [Architecture Design](/Users/liqiuhua/.config/superpowers/worktrees/claw_native_kshop/codex-openclaw-native-commerce/docs/plans/2026-03-22-openclaw-native-commerce-design.md)
- [Implementation Plan](/Users/liqiuhua/.config/superpowers/worktrees/claw_native_kshop/codex-openclaw-native-commerce/docs/plans/2026-03-22-openclaw-native-commerce-implementation.md)

## Module Matrix

| Module | Designed Responsibility | Implemented Responsibility | Match Status | Deviation | Follow-up Action |
| --- | --- | --- | --- | --- | --- |
| Workspace tooling | pnpm, TypeScript, Vitest, ESLint baseline | Implemented | Match | None | None |
| Shared helpers | Result and branded IDs | Implemented | Match | None | None |
| Contracts | Buyer/seller schemas | Implemented | Match | None | None |
| Catalog | Canonical normalization and substitution scoring | Implemented | Match | Narrow to eggs path first | Extend categories later |
| Policy engine | Approval/rejection boundaries | Implemented | Match | None | None |
| Demand planner | Convert inventory signals into intents | Implemented | Match | Defaults are explicit inputs | Expand planning inputs later |
| Seller protocol | RFQ / Quote / Hold / Commit schema | Implemented | Match | None | None |
| Seller simulator | Local seller-side Fastify test double | Implemented | Match | In-memory only | Replace with external network adapter later |
| Offer evaluator | Deterministic ranking | Implemented | Match | None | None |
| Memory | Audit and order snapshot store | Implemented | Match | In-memory only | Persist if needed later |
| Orchestrator | Typed state machine and scenario runner | Implemented | Match | Minimal transitions only | Expand transition guards later |
| Checkout | Payment authorization and commit path | Implemented | Match | Optional compensation hook only | Add explicit compensation adapters later |
| Fulfillment | Delay/damage exception detection | Implemented | Match | Minimal status set only | Add richer event taxonomy later |
| Buyer API | Replenishment and order explanation routes | Implemented | Match | Uses shared in-memory store for local runtime | Replace with persistent adapter when needed |
| Guardrails | Architecture boundary tests | Implemented | Match | Source inspection checks are local-repo specific | Replace with stronger static analysis if codebase grows |
| E2E scenarios | Happy path and hold-failure retry | Implemented | Match | Approval-required regression added; retry path still minimal | Expand recovery and replay later |

## Deviations

- No unresolved critical deviations remain.
- Accepted MVP deviations:
  - catalog normalization is intentionally narrow to the `eggs` path
  - memory and seller simulator remain in-memory for local verification
  - orchestrator transitions are intentionally minimal but covered by state and E2E tests
