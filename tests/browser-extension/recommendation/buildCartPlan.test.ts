import { describe, expect, it } from "vitest";

import { buildCartPlan } from "../../../apps/browser-extension/src/recommendation/buildCartPlan.js";

describe("buildCartPlan", () => {
  it("returns a concrete top-up summary and action for a threshold-based cart", () => {
    const plan = buildCartPlan({
      items: [
        {
          title: "立白洗衣液 2kg",
          unitPrice: 29.9,
          quantity: 1,
          sellerType: "marketplace",
          packageLabel: "2kg",
        },
        {
          title: "抽纸",
          unitPrice: 12,
          quantity: 1,
          sellerType: "self_operated",
          packageLabel: "3包",
        },
      ],
      thresholdRules: [{ threshold: 59, discount: 10 }],
    });

    expect(plan.summary).toBe("再补 17.10 元可满 59 减 10。");
    expect(plan.actions.some((a) => a.includes("加购 2 件「抽纸」"))).toBe(true);
  });

  it("returns the direct checkout branch when the cart already qualifies", () => {
    const plan = buildCartPlan({
      items: [
        {
          title: "立白洗衣液 2kg",
          unitPrice: 29.9,
          quantity: 1,
          sellerType: "marketplace",
          packageLabel: "2kg",
        },
        {
          title: "抽纸",
          unitPrice: 12,
          quantity: 1,
          sellerType: "self_operated",
          packageLabel: "3包",
        },
      ],
      thresholdRules: [{ threshold: 40, discount: 5 }],
    });

    expect(plan.summary).toBe("已满足满 40 减 5，可以直接结算。");
    expect(plan.actions).toContain("保持当前购物车并结算");
    expect(plan.discount).toBe(5);
    expect(plan.effectiveTotal).toBeCloseTo(36.9);
  });

  it("does not include discount when rule is not satisfied", () => {
    const plan = buildCartPlan({
      items: [
        {
          title: "立白洗衣液 2kg",
          unitPrice: 29.9,
          quantity: 1,
          sellerType: "marketplace",
          packageLabel: "2kg",
        },
      ],
      thresholdRules: [{ threshold: 59, discount: 10 }],
    });

    expect(plan.discount).toBeUndefined();
    expect(plan.effectiveTotal).toBeUndefined();
  });

  it("stacks a qualified coupon on top of the manjian discount", () => {
    const plan = buildCartPlan({
      items: [
        {
          title: "立白洗衣液 2kg",
          unitPrice: 29.9,
          quantity: 1,
          sellerType: "marketplace",
          packageLabel: "2kg",
        },
        {
          title: "抽纸",
          unitPrice: 12,
          quantity: 1,
          sellerType: "self_operated",
          packageLabel: "3包",
        },
      ],
      thresholdRules: [{ threshold: 40, discount: 5 }],
      couponsByShop: {
        "__default__": [{ value: 10, threshold: 30, label: "满30减10券" }],
      },
    });

    // subtotal 41.9, manjian -5, coupon -10 → effectiveTotal 26.9
    expect(plan.effectiveTotal).toBeCloseTo(26.9);
    expect(plan.discount).toBeCloseTo(15);
    const types = plan.breakdown?.map((b) => b.type) ?? [];
    expect(types).toContain("manjian");
    expect(types).toContain("coupon");
  });

  it("respects coupon.stackable=false and only applies the manjian", () => {
    const plan = buildCartPlan({
      items: [
        {
          title: "立白洗衣液 2kg",
          unitPrice: 29.9,
          quantity: 1,
          sellerType: "marketplace",
          packageLabel: "2kg",
        },
      ],
      thresholdRules: [{ threshold: 20, discount: 3 }],
      couponsByShop: {
        "__default__": [
          { value: 5, threshold: 0, label: "5元券", stackable: false },
        ],
      },
    });

    // subtotal 29.9, manjian -3, coupon blocked → effectiveTotal 26.9
    expect(plan.effectiveTotal).toBeCloseTo(26.9);
    expect(plan.discount).toBeCloseTo(3);
    const types = plan.breakdown?.map((b) => b.type) ?? [];
    expect(types).toEqual(["manjian"]);
  });

  it("applies cross-store rule on top of in-store manjian when threshold met", () => {
    const plan = buildCartPlan({
      items: [
        {
          title: "A 商品",
          unitPrice: 180,
          quantity: 1,
          sellerType: "marketplace",
          packageLabel: null,
        },
        {
          title: "B 商品",
          unitPrice: 150,
          quantity: 1,
          sellerType: "self_operated",
          packageLabel: null,
        },
      ],
      thresholdRules: [{ threshold: 200, discount: 20 }],
      crossStoreRules: [
        {
          type: "cross_store_manjian",
          threshold: 300,
          discount: 50,
          label: "跨店满300减50",
          stackableWithCoupon: true,
        },
      ],
    });

    // subtotal 330, manjian -20, cross-store -50 → 260
    expect(plan.effectiveTotal).toBeCloseTo(260);
    expect(plan.discount).toBeCloseTo(70);
    const labels = plan.breakdown?.map((b) => b.label) ?? [];
    expect(labels).toContain("满200减20");
    expect(labels).toContain("跨店满300减50");
  });

  it("does not apply cross-store rule when subtotal below its threshold", () => {
    const plan = buildCartPlan({
      items: [
        {
          title: "A",
          unitPrice: 100,
          quantity: 1,
          sellerType: "marketplace",
          packageLabel: null,
        },
      ],
      thresholdRules: [],
      crossStoreRules: [
        {
          type: "cross_store_manjian",
          threshold: 300,
          discount: 50,
          label: "跨店满300减50",
          stackableWithCoupon: true,
        },
      ],
    });

    expect(plan.discount).toBeUndefined();
    expect(plan.effectiveTotal).toBeUndefined();
  });

  it("includes a breakdown even when there is no manjian rule but a coupon applies", () => {
    const plan = buildCartPlan({
      items: [
        {
          title: "A",
          unitPrice: 50,
          quantity: 1,
          sellerType: "marketplace",
          packageLabel: null,
        },
      ],
      thresholdRules: [],
      couponsByShop: {
        "__default__": [{ value: 5, threshold: 0, label: "5元券" }],
      },
    });

    expect(plan.summary).toContain("直接结算");
    expect(plan.effectiveTotal).toBeCloseTo(45);
    expect(plan.discount).toBeCloseTo(5);
    expect(plan.breakdown?.[0]?.type).toBe("coupon");
  });

  it("picks the item with minimum overflow, not just the cheapest unit", () => {
    const plan = buildCartPlan({
      items: [
        {
          title: "大件",
          unitPrice: 30,
          quantity: 1,
          sellerType: "marketplace",
          packageLabel: null,
        },
        {
          title: "小件",
          unitPrice: 12,
          quantity: 1,
          sellerType: "self_operated",
          packageLabel: null,
        },
      ],
      thresholdRules: [{ threshold: 59, discount: 10 }],
    });

    // subtotal 42, gap 17
    // 小件 × 2 = 24 overflow 7 ← winner (smallest)
    // 大件 × 1 = 30 overflow 13
    const topUpAction = plan.actions.find((a) => a.includes("凑单"));
    expect(topUpAction).toContain("加购 2 件「小件」");
    expect(topUpAction).toContain("多花 ¥7.00");
    expect(topUpAction).toContain("净省 ¥3.00");
  });

  it("warns against top-up when overflow would exceed the discount", () => {
    const plan = buildCartPlan({
      items: [
        {
          title: "大件",
          unitPrice: 29,
          quantity: 1,
          sellerType: "marketplace",
          packageLabel: null,
        },
      ],
      thresholdRules: [{ threshold: 34, discount: 3 }],
    });

    // subtotal 29, gap 5
    // 大件 × 1 = 29 → 新总价 58, overflow 24 > discount 3 → bad deal
    expect(plan.actions.some((a) => a.includes("凑单不划算"))).toBe(true);
    expect(plan.actions.some((a) => a.includes("加购"))).toBe(false);
  });

  it("does not recommend top-up when the cart already qualifies", () => {
    const plan = buildCartPlan({
      items: [
        {
          title: "A",
          unitPrice: 60,
          quantity: 1,
          sellerType: "marketplace",
          packageLabel: null,
        },
      ],
      thresholdRules: [{ threshold: 50, discount: 5 }],
    });

    expect(plan.actions.every((a) => !a.includes("凑单"))).toBe(true);
    expect(plan.summary).toContain("已满足");
  });
});
