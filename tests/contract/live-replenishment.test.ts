import { describe, expect, it } from "vitest";

import { LiveReplenishmentRequestSchema } from "../../packages/contracts/src/live-replenishment.js";

describe("live replenishment contract", () => {
  it("parses a valid scenario-aware live request", () => {
    const parsed = LiveReplenishmentRequestSchema.parse({
      scenarioId: "seller-eta-tradeoff",
      mode: "value",
    });

    expect(parsed.scenarioId).toBe("seller-eta-tradeoff");
    expect(parsed.mode).toBe("value");
  });

  it("rejects invalid scenario ids and modes", () => {
    expect(() =>
      LiveReplenishmentRequestSchema.parse({
        scenarioId: "unknown-scenario",
        mode: "value",
      }),
    ).toThrow();

    expect(() =>
      LiveReplenishmentRequestSchema.parse({
        scenarioId: "replenish-laundry",
        mode: "unknown-mode",
      }),
    ).toThrow();
  });
});
