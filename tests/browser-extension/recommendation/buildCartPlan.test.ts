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
    expect(plan.actions).toContain("加购 2 件「抽纸」凑单");
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
  });
});
