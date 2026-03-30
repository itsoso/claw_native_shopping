import { describe, expect, it } from "vitest";

import { runDemoScenario } from "../../apps/web/src/runtime/demoRuntime.js";

describe("demo runtime", () => {
  it("returns a five-step investor-facing validation flow", async () => {
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
  });
});
