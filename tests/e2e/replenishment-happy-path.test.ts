import { describe, expect, it } from "vitest";
import { buildSellerSimServer } from "../../apps/seller-sim/src/server.js";
import { runProcurementScenario } from "../../packages/orchestrator/src/service.js";
import { createSellerSimProtocolPort } from "../helpers/request-quote.js";
import { happyPathScenario } from "../fixtures/happy-path-scenario.js";

describe("replenishment happy path", () => {
  it("commits an order end to end", async () => {
    const app = buildSellerSimServer();

    try {
      const result = await runProcurementScenario({
        ...happyPathScenario,
        sellerPort: createSellerSimProtocolPort(app)
      });

      expect(result.status).toBe("orderCommitted");
      expect(result.explanation).toContain("ORDER_COMMITTED");
    } finally {
      await app.close();
    }
  });

  it("stops before commit when approval is required", async () => {
    const app = buildSellerSimServer();

    try {
      const result = await runProcurementScenario({
        ...happyPathScenario,
        policyAutoApproveLimit: 10,
        sellerPort: createSellerSimProtocolPort(app)
      });

      if (result.status !== "approvalRequired") {
        throw new Error(`expected approvalRequired, got ${result.status}`);
      }

      expect(result.status).toBe("approvalRequired");
      expect(result.reason).toBe("approval_required");
      expect(result.explanation).toContain("QUOTE_SELECTED");
      expect(result.explanation).toContain("POLICY_EVALUATED");
      expect(result.explanation).toContain("APPROVAL_REQUIRED");
      expect(result.explanation).not.toContain("ORDER_COMMITTED");
      expect(result.snapshot.status).toBe("approvalWait");
      expect(result.snapshot.policyDecision).toBe("approval_required");
    } finally {
      await app.close();
    }
  });
});
