import { describe, expect, it } from "vitest";

import { buildProductDecision } from "../../../apps/browser-extension/src/recommendation/buildProductDecision.js";

describe("buildProductDecision", () => {
  it("prefers a self-operated faster alternative in time_saving mode", () => {
    const decision = buildProductDecision(
      {
        current: {
          title: "立白洗衣液 2kg",
          unitPrice: 29.9,
          sellerType: "marketplace",
          deliveryEta: "后天送达",
          packageLabel: "2kg",
        },
        alternatives: [
          {
            title: "立白洗衣液 2kg",
            unitPrice: 31.9,
            sellerType: "self_operated",
            deliveryEta: "明天送达",
            packageLabel: "2kg",
          },
        ],
      },
      { mode: "time_saving" },
    );

    expect(decision.mode).toBe("time_saving");
    expect(decision.chosen.sellerType).toBe("self_operated");
    expect(decision.chosen.deliveryEta).toBe("明天送达");
    expect(decision.primaryAction).toContain("自营");
    expect(decision.reason).toContain("明天");
  });
});
