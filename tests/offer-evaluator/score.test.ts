import { describe, expect, it } from "vitest";
import { rankOffers } from "../../packages/offer-evaluator/src/score.js";

describe("rankOffers", () => {
  it("prefers policy-compliant faster offers over slightly cheaper risky offers", () => {
    const ranked = rankOffers([
      { sellerId: "fast", totalCost: 30, etaHours: 4, trust: 0.9, policyMatch: 1 },
      { sellerId: "cheap", totalCost: 28, etaHours: 20, trust: 0.3, policyMatch: 0.4 }
    ]);

    expect(ranked[0]?.sellerId).toBe("fast");
  });
});
