# OpenClaw Web Demo Architecture Conformance

Reference design:
- [Web Demo Design](/Users/liqiuhua/.config/superpowers/worktrees/claw_native_kshop/codex-web-demo-product/docs/plans/2026-03-25-openclaw-web-demo-design.md)
- [Web Demo Implementation Plan](/Users/liqiuhua/.config/superpowers/worktrees/claw_native_kshop/codex-web-demo-product/docs/plans/2026-03-25-openclaw-web-demo.md)

## Module Matrix

| Module | Designed Responsibility | Implemented Responsibility | Match Status | Deviation | Follow-up Action |
| --- | --- | --- | --- | --- | --- |
| Standalone web app | Household-first runnable product demo | Implemented at `apps/web` with direct local startup scripts | Match | None | None |
| Hero + scenario switcher | Default household entry, office toggle | Implemented with household-first copy, tabs, and demo path pills | Match | None | None |
| Inventory pressure panel | Show shortages and policy context | Implemented with scenario metadata for household and office cards | Match | Static presentation data, not live inventory | Replace with live state when a real inventory source exists |
| Procurement flow visualization | User-facing procurement state progression | Implemented from actual backend explanation events | Match | Timeline is event-driven rather than a richer state graph | Expand labels and visual states later if needed |
| Explanation drawer | Show audit trail and snapshot details | Implemented with deferred fetch to `/orders/:id/explanation` | Match | Raw event codes are shown alongside product labels | Add friendlier copy if external users need it |
| Buyer API scenario routing | Accept scenario-specific replenishment runs | Implemented with `scenarioId` and demo overrides | Match | None | None |
| Browser runtime support | Web app must work against local API in a browser | Implemented with explicit CORS handling and preflight coverage | Match | None | None |
| Browser verification | Household flow, office switch, unavailable state | Implemented in Playwright with multi-service startup | Match | None | None |

## Accepted Deviations

- The browser demo talks to the buyer API, but the buyer API still uses deterministic internal seller fixtures for the happy path instead of proxying through the standalone `seller-sim` service.
- This does not block the product demo because:
  - the visible order flow is still driven by a real HTTP API
  - seller protocol behavior is still covered by existing integration tests
  - the web demo requirements focus on user-visible replenishment experience, explanation, and browser execution

## Conformance Summary

- Household-first landing experience: implemented
- Office scenario in the same app: implemented
- Real buyer API integration: implemented
- Explanation drawer and audit visibility: implemented
- Browser-unavailable error handling: implemented
- Automated verification across unit, integration, build, and browser layers: implemented

No unresolved critical deviations remain for the demo scope.
