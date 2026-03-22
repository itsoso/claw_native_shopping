import { describe, expect, it } from "vitest";
import {
  canModuleAccessPayment,
  canModuleChangeOrderState,
  requiresAuditEvent
} from "../helpers/architecture-guards.js";

describe("architecture guardrails", () => {
  it("prevents llm-facing modules from directly using payment ports", () => {
    expect(canModuleAccessPayment("negotiation-agent")).toBe(false);
  });

  it("allows only the orchestrator to mutate order state", () => {
    expect(canModuleChangeOrderState("orchestrator")).toBe(true);
    expect(canModuleChangeOrderState("checkout")).toBe(false);
  });

  it("requires audit events for committed orders", () => {
    expect(requiresAuditEvent("orderCommitted")).toBe(true);
  });
});
