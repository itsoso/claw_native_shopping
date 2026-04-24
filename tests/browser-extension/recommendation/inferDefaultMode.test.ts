import { describe, expect, it } from "vitest";

import { inferDefaultMode } from "../../../apps/browser-extension/src/recommendation/inferDefaultMode.js";
import type { SavingsRecord } from "../../../apps/browser-extension/src/types/savingsRecord.js";
import type { ViewedProduct } from "../../../apps/browser-extension/src/types/viewedProduct.js";

function viewed(sellerType: "self_operated" | "marketplace", i: number): ViewedProduct {
  return {
    skuId: `sku${i}`,
    title: `item${i}`,
    unitPrice: 50,
    sellerType,
    url: `https://example.com/${i}`,
    viewedAt: Date.now() - i * 1000,
  };
}

function saving(i: number): SavingsRecord {
  return {
    skuId: `sku${i}`,
    title: `item${i}`,
    originalPrice: 100,
    savedPrice: 80,
    savedAmount: 20,
    sellerType: "self_operated",
    url: `https://example.com/${i}`,
    createdAt: Date.now() - i * 1000,
  };
}

describe("inferDefaultMode", () => {
  it("returns safe when self-operated viewing ratio clears 70% and sample is large enough", () => {
    const viewedProducts = [
      viewed("self_operated", 1),
      viewed("self_operated", 2),
      viewed("self_operated", 3),
      viewed("self_operated", 4),
      viewed("marketplace", 5),
    ];
    const result = inferDefaultMode({ viewedProducts, savingsRecords: [] });

    expect(result.mode).toBe("safe");
    expect(result.reason).toContain("自营");
  });

  it("requires at least 5 viewed products before inferring safe mode", () => {
    const viewedProducts = [
      viewed("self_operated", 1),
      viewed("self_operated", 2),
      viewed("self_operated", 3),
    ];
    const result = inferDefaultMode({ viewedProducts, savingsRecords: [] });

    expect(result.mode).toBe("time_saving");
  });

  it("returns value when three or more savings records exist", () => {
    const result = inferDefaultMode({
      viewedProducts: [],
      savingsRecords: [saving(1), saving(2), saving(3)],
    });

    expect(result.mode).toBe("value");
    expect(result.reason).toContain("价格");
  });

  it("prefers safe over value when both heuristics match", () => {
    const viewedProducts = [
      viewed("self_operated", 1),
      viewed("self_operated", 2),
      viewed("self_operated", 3),
      viewed("self_operated", 4),
      viewed("self_operated", 5),
    ];
    const savingsRecords = [saving(1), saving(2), saving(3), saving(4)];

    const result = inferDefaultMode({ viewedProducts, savingsRecords });
    expect(result.mode).toBe("safe");
  });

  it("falls back to time_saving when neither heuristic triggers", () => {
    const result = inferDefaultMode({ viewedProducts: [], savingsRecords: [] });

    expect(result.mode).toBe("time_saving");
  });

  it("does not select safe when self-operated ratio is below 70%", () => {
    const viewedProducts = [
      viewed("self_operated", 1),
      viewed("self_operated", 2),
      viewed("self_operated", 3),
      viewed("marketplace", 4),
      viewed("marketplace", 5),
      viewed("marketplace", 6),
    ];
    const result = inferDefaultMode({ viewedProducts, savingsRecords: [] });

    expect(result.mode).toBe("time_saving");
  });
});
