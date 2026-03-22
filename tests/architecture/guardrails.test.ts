import { describe, expect, it } from "vitest";
import {
  findOrderStateMutationViolations,
  findPaymentPortImportViolations,
  serviceEmitsCommittedOrderAuditEvent
} from "../helpers/architecture-guards.js";

describe("architecture guardrails", () => {
  it("prevents llm-facing modules from directly using payment ports", () => {
    expect(findPaymentPortImportViolations()).toEqual([]);
  });

  it("allows only the orchestrator to mutate order state", () => {
    expect(findOrderStateMutationViolations()).toEqual([]);
  });

  it("requires audit events for committed orders", () => {
    expect(serviceEmitsCommittedOrderAuditEvent()).toBe(true);
  });
});
