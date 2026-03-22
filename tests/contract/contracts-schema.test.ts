import { describe, expect, it } from "vitest";
import { DemandIntentSchema } from "../../packages/contracts/src/demand-intent.js";

describe("contract schemas", () => {
  it("parses a demand intent", () => {
    const parsed = DemandIntentSchema.parse({
      id: "intent_1",
      category: "eggs",
      normalizedAttributes: { raising_method: "free_range" },
      quantity: 2,
      urgency: "soon",
      deliveryWindow: { latestAt: "2026-03-23T10:00:00+08:00" },
      budgetLimit: 40,
      substitutionPolicy: "allowed",
      sourceSignals: ["inventory_threshold"]
    });

    expect(parsed.category).toBe("eggs");
  });
});
