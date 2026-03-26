import { describe, expect, it } from "vitest";

import { demoScenarios } from "../../apps/web/src/scenarios/index.js";

describe("demo scenarios", () => {
  it("ships three investor-safe preset scenarios", () => {
    expect(demoScenarios).toHaveLength(3);
    expect(demoScenarios.map((scenario) => scenario.id)).toEqual([
      "replenish-laundry",
      "optimize-cart-threshold",
      "seller-eta-tradeoff",
    ]);
  });
});
