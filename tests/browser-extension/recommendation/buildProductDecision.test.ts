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

  it("includes price trend in reason when priceHistory is provided", () => {
    const decision = buildProductDecision(
      {
        current: {
          title: "立白洗衣液 2kg",
          unitPrice: 19.9,
          sellerType: "self_operated",
          deliveryEta: "明天送达",
          packageLabel: "2kg",
        },
        alternatives: [],
        priceHistory: {
          trend: "low",
          currentPrice: 19.9,
          lowestPrice: 17.5,
          highestPrice: 35.0,
          averagePrice: 25.0,
        },
      },
      { mode: "value" },
    );

    expect(decision.reason).toContain("近期低价");
    expect(decision.reason).toContain("更划算");
  });

  it("includes high price warning in reason", () => {
    const decision = buildProductDecision(
      {
        current: {
          title: "立白洗衣液 2kg",
          unitPrice: 33.0,
          sellerType: "self_operated",
          deliveryEta: "明天送达",
          packageLabel: "2kg",
        },
        alternatives: [],
        priceHistory: {
          trend: "high",
          currentPrice: 33.0,
          lowestPrice: 17.5,
          highestPrice: 35.0,
          averagePrice: 25.0,
        },
      },
      { mode: "safe" },
    );

    expect(decision.reason).toContain("价格偏高");
    expect(decision.reason).toContain("更稳妥");
  });

  it("omits trend info when priceHistory is not provided", () => {
    const decision = buildProductDecision(
      {
        current: {
          title: "立白洗衣液 2kg",
          unitPrice: 29.9,
          sellerType: "self_operated",
          deliveryEta: "明天送达",
          packageLabel: "2kg",
        },
        alternatives: [],
      },
      { mode: "time_saving" },
    );

    expect(decision.reason).not.toContain("近期低价");
    expect(decision.reason).not.toContain("价格偏高");
  });
});
