# OpenClaw Web Demo Code Review

## Review Focus

- correctness of the standalone web experience
- scenario switching and state isolation
- buyer API integration and browser runtime behavior
- explanation and audit visibility
- test coverage for product and browser paths

## Review Coverage

- [x] `apps/web` shell, components, client, and scenario metadata
- [x] scenario-aware `buyer API` route changes
- [x] orchestration scenario fixtures
- [x] browser CORS path between `apps/web` and `apps/api`
- [x] Playwright multi-service startup
- [x] unit, integration, and browser E2E additions

## Findings

- Initial implementation issues that were found and resolved before merge:
  - the standalone web app could render in tests, but browser E2E exposed a real CORS failure between `http://127.0.0.1:4174` and `http://127.0.0.1:3000`; the buyer API now serves explicit preflight and response headers
  - explanation drawer assertions originally collided with duplicated event codes rendered in both the visible timeline and the drawer; tests now scope to the drawer surface
  - Playwright initially only started the extension fixture server; it now boots the buyer API, standalone web app, and extension fixture server together

- Final review outcome:
  - No unresolved important issues remain.

## Verification Evidence

- `pnpm verify`
  - pass
  - `35` test files
  - `55` tests
- `pnpm test:e2e`
  - pass
  - `4` browser tests
- `pnpm build:web`
  - pass
