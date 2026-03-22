import { describe, expect, it } from "vitest";
import { planDemand } from "../../packages/demand-planner/src/plan.js";

describe("planDemand", () => {
  it("creates a replenishment intent when inventory is below threshold", () => {
    const intents = planDemand({
      inventory: [{ sku: "egg-12", quantityOnHand: 2, reorderPoint: 4 }],
      catalogMap: {
        "egg-12": { category: "eggs", normalizedAttributes: { count: 12 } }
      }
    });

    expect(intents).toHaveLength(1);
    expect(intents[0]?.category).toBe("eggs");
  });
});
