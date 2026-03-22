import { describe, expect, it } from "vitest";
import {
  findCommittedOrderAuditViolations,
  findOrderStateWriterViolations,
  findPaymentPortLeaks
} from "../helpers/architecture-guards.js";

describe("architecture guardrails", () => {
  it("keeps payment ports inside checkout", async () => {
    const leaks = await findPaymentPortLeaks();

    expect(leaks).toEqual([]);
  });

  it("allows only the orchestrator to mutate order state", async () => {
    const violations = await findOrderStateWriterViolations();

    expect(violations).toEqual([]);
  });

  it("requires committed orders to emit audit events", async () => {
    const violations = await findCommittedOrderAuditViolations();

    expect(violations).toEqual([]);
  });
});
