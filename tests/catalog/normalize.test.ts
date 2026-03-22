import { describe, expect, it } from "vitest";
import { normalizeProductSpec } from "../../packages/catalog/src/normalize.js";

describe("normalizeProductSpec", () => {
  it("normalizes egg attributes into canonical fields", () => {
    const normalized = normalizeProductSpec({
      sellerProductId: "s1",
      category: "eggs",
      attributes: {
        count: "12",
        raisingMethod: "Free Range"
      }
    });

    expect(normalized.attributes).toEqual({
      count: 12,
      raising_method: "free_range"
    });
  });
});
