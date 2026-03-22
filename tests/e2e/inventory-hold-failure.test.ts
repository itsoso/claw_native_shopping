import { describe, expect, it } from "vitest";
import { buildSellerSimServer } from "../../apps/seller-sim/src/server.js";
import { runProcurementScenario } from "../../packages/orchestrator/src/service.js";
import { createSellerSimProtocolPort } from "../helpers/request-quote.js";
import { inventoryHoldFailureScenario } from "../fixtures/inventory-hold-failure-scenario.js";

describe("inventory hold failure", () => {
  it("records a retry path when inventory hold fails", async () => {
    const app = buildSellerSimServer();

    try {
      const result = await runProcurementScenario({
        ...inventoryHoldFailureScenario,
        sellerPort: createSellerSimProtocolPort(app)
      });

      expect(result.status).toBe("retry");
      expect(result.explanation).toContain("INVENTORY_HOLD_FAILED");
    } finally {
      await app.close();
    }
  });
});
