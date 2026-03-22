# OpenClaw Native Commerce Review Checklist

- [ ] Each module has a narrow responsibility.
- [ ] Public APIs are typed and exported from package entrypoints.
- [ ] No payment or fulfillment shortcuts bypass orchestrator flow.
- [ ] Policy rejection stays separate from approval-required decisions.
- [ ] No fake business facts are hardcoded into demand or order data.
- [ ] Seller and buyer contracts validate at the boundary.
- [ ] Tests cover happy path and at least one failure path per major flow.
- [ ] Any new shared state is persisted in the memory layer or a clear adapter.
