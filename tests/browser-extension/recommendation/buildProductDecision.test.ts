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

  it("prefers lower effectivePrice over lower unitPrice in value mode", () => {
    const decision = buildProductDecision(
      {
        current: {
          title: "商品A",
          unitPrice: 100,
          sellerType: "marketplace",
          deliveryEta: null,
          packageLabel: null,
          effectivePrice: 70,
        },
        alternatives: [
          {
            title: "商品B",
            unitPrice: 80,
            sellerType: "marketplace",
            deliveryEta: null,
            packageLabel: null,
          },
        ],
      },
      { mode: "value" },
    );

    expect(decision.chosen.title).toBe("商品A");
  });

  it("includes effective price in value mode reason", () => {
    const decision = buildProductDecision(
      {
        current: {
          title: "商品A",
          unitPrice: 199,
          sellerType: "self_operated",
          deliveryEta: "明天送达",
          packageLabel: null,
          effectivePrice: 99,
          promotions: {
            rules: [{ type: "manjian", threshold: 199, discount: 100, label: "满199减100" }],
            coupons: [],
          },
        },
        alternatives: [],
      },
      { mode: "value" },
    );

    expect(decision.reason).toContain("标价 199.00");
    expect(decision.reason).toContain("到手价 99.00");
  });

  it("attaches a structured explanation with price/seller/delivery factors", () => {
    const decision = buildProductDecision(
      {
        current: {
          title: "商品A",
          unitPrice: 29.9,
          sellerType: "self_operated",
          deliveryEta: "明天送达",
          packageLabel: "2kg",
        },
        alternatives: [],
      },
      { mode: "time_saving" },
    );

    const kinds = decision.explanation.factors.map((f) => f.kind);
    expect(kinds).toContain("price");
    expect(kinds).toContain("seller");
    expect(kinds).toContain("delivery");
    expect(decision.explanation.mode).toBe("time_saving");
  });

  it("includes price_history factor only when chosen is the current SKU", () => {
    const currentWins = buildProductDecision(
      {
        current: {
          title: "A",
          unitPrice: 20,
          sellerType: "self_operated",
          deliveryEta: "今日达",
          packageLabel: null,
        },
        alternatives: [
          {
            title: "B",
            unitPrice: 50,
            sellerType: "marketplace",
            deliveryEta: null,
            packageLabel: null,
          },
        ],
        priceHistory: {
          trend: "low",
          currentPrice: 20,
          lowestPrice: 18,
          highestPrice: 40,
          averagePrice: 28,
        },
      },
      { mode: "time_saving" },
    );

    expect(currentWins.chosen.title).toBe("A");
    expect(
      currentWins.explanation.factors.some((f) => f.kind === "price_history"),
    ).toBe(true);

    const altWins = buildProductDecision(
      {
        current: {
          title: "A",
          unitPrice: 50,
          sellerType: "marketplace",
          deliveryEta: null,
          packageLabel: null,
        },
        alternatives: [
          {
            title: "B",
            unitPrice: 20,
            sellerType: "self_operated",
            deliveryEta: "今日达",
            packageLabel: null,
          },
        ],
        priceHistory: {
          trend: "low",
          currentPrice: 50,
          lowestPrice: 18,
          highestPrice: 40,
          averagePrice: 28,
        },
      },
      { mode: "time_saving" },
    );

    expect(altWins.chosen.title).toBe("B");
    expect(
      altWins.explanation.factors.some((f) => f.kind === "price_history"),
    ).toBe(false);
  });

  it("surfaces applied promotion breakdown as a promotion factor", () => {
    const decision = buildProductDecision(
      {
        current: {
          title: "A",
          unitPrice: 100,
          sellerType: "self_operated",
          deliveryEta: "明天送达",
          packageLabel: null,
          effectivePrice: 65,
          effectivePriceBreakdown: [
            { type: "manjian", label: "满99减10", amount: 10, applied: true },
            { type: "coupon", label: "满99减25券", amount: 25, applied: true },
            { type: "manzhe_potential", label: "满3件8折", amount: 20, applied: false },
          ],
        },
        alternatives: [],
      },
      { mode: "value" },
    );

    const promo = decision.explanation.factors.find((f) => f.kind === "promotion");
    expect(promo).toBeDefined();
    expect(promo!.label).toContain("省 ¥35");
    expect(promo!.detail).toContain("满99减10");
    expect(promo!.detail).toContain("满99减25券");
    // potential (applied:false) should not be counted
    expect(promo!.detail).not.toContain("满3件8折");
  });

  it("computes price and delivery deltas for alternatives", () => {
    const decision = buildProductDecision(
      {
        current: {
          title: "A",
          unitPrice: 29.9,
          sellerType: "marketplace",
          deliveryEta: "后天送达",
          packageLabel: null,
        },
        alternatives: [
          {
            title: "B",
            unitPrice: 31.9,
            sellerType: "self_operated",
            deliveryEta: "明天送达",
            packageLabel: null,
          },
        ],
      },
      { mode: "time_saving" },
    );

    // chosen is B (self-op, faster)
    expect(decision.chosen.title).toBe("B");
    const comps = decision.explanation.alternatives;
    expect(comps).toHaveLength(1);
    expect(comps[0]!.title).toBe("A");
    expect(comps[0]!.priceDelta).toBeCloseTo(31.9 - 29.9);
    // B is "明天" rank 2, A is "后天" rank 1 → delta 1
    expect(comps[0]!.deliveryDelta).toBe(1);
    expect(comps[0]!.sameSellerType).toBe(false);
  });

  it("returns an empty alternatives list when no alternatives provided", () => {
    const decision = buildProductDecision(
      {
        current: {
          title: "A",
          unitPrice: 29.9,
          sellerType: "self_operated",
          deliveryEta: "明天送达",
          packageLabel: null,
        },
        alternatives: [],
      },
      { mode: "time_saving" },
    );

    expect(decision.explanation.alternatives).toEqual([]);
  });
});
