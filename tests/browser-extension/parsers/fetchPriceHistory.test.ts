import { describe, expect, it } from "vitest";

import {
  classifyTrend,
  computeAverage,
} from "../../../apps/browser-extension/src/parsers/fetchPriceHistory.js";

describe("fetchPriceHistory helpers", () => {
  describe("classifyTrend", () => {
    it("returns low when price is in the bottom third", () => {
      expect(classifyTrend(110, 100, 200, 150)).toBe("low");
    });

    it("returns high when price is in the top third", () => {
      expect(classifyTrend(190, 100, 200, 150)).toBe("high");
    });

    it("returns average when price is in the middle", () => {
      expect(classifyTrend(150, 100, 200, 150)).toBe("average");
    });

    it("returns average when lowest equals highest", () => {
      expect(classifyTrend(100, 100, 100, 100)).toBe("average");
    });
  });

  describe("computeAverage", () => {
    it("computes the mean of prices", () => {
      expect(computeAverage([10, 20, 30])).toBe(20);
    });

    it("returns 0 for empty array", () => {
      expect(computeAverage([])).toBe(0);
    });

    it("rounds to two decimal places", () => {
      expect(computeAverage([10, 20, 33])).toBe(21);
    });
  });
});
