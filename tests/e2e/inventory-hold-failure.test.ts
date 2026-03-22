import { describe, expect, it } from "vitest";
import { runProcurementScenario } from "../../packages/orchestrator/src/service.js";
import { inventoryHoldFailureScenario } from "../fixtures/inventory-hold-failure-scenario.js";

describe("inventory hold failure", () => {
  it("records a retry path when inventory hold fails", async () => {
    const result = await runProcurementScenario(inventoryHoldFailureScenario);

    expect(result.status).toBe("retry");
    expect(result.explanation).toContain("INVENTORY_HOLD_FAILED");
  });
});
