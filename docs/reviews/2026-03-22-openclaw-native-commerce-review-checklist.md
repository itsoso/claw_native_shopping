# OpenClaw Native Commerce Review Checklist

- [x] Each module has a narrow responsibility.
- [x] Public APIs are typed and exported from package entrypoints.
- [x] No payment or fulfillment shortcuts bypass orchestrator flow.
- [x] Policy rejection stays separate from approval-required decisions.
- [x] No fake business facts are hardcoded into demand or order data.
- [x] Seller and buyer contracts validate at the boundary.
- [x] Tests cover happy path and at least one failure path per major flow.
- [x] Any new shared state is persisted in the memory layer or a clear adapter.
