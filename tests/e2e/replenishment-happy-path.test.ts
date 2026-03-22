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
});
