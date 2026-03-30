import { describe, expect, it } from "vitest";

import { runDemoScenario } from "../../apps/web/src/runtime/demoRuntime.js";

describe("demo runtime", () => {
  it("returns a five-step investor-facing validation flow with a concrete offer summary", async () => {
    const result = await runDemoScenario("replenish-laundry", "time_saving");

    expect(result.runtime).toBe("demo");
    expect(result.steps.map((step) => step.id)).toEqual([
      "demand",
      "decision",
      "cart-plan",
      "seller-order",
      "explanation",
    ]);
    expect(result.explanationTags).toEqual([
      "家庭补货",
      "高频复购",
      "更省时间",
    ]);
    expect(result.summary).toContain("OpenClaw");
    expect(result.outcome.sellerLabel).toBe("晨光农场直营网");
    expect(result.outcome.priceLabel).toBe("30 元");
    expect(result.outcome.etaLabel).toBe("明早 09:00 前送达");
    expect(result.outcome.comparisonLabel).toBe("已比较 2 个可履约卖家");
  });
});
