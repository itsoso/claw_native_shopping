// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

import { PriceTrendBadge } from "../../../apps/browser-extension/src/ui/PriceTrendBadge.js";
import type { PriceHistoryInfo } from "../../../apps/browser-extension/src/types/product.js";

describe("PriceTrendBadge", () => {
  it("shows '近期低价' pill with lowest price for low trend", () => {
    const info: PriceHistoryInfo = {
      trend: "low",
      currentPrice: 19.9,
      lowestPrice: 17.5,
      highestPrice: 35.0,
      averagePrice: 25.0,
    };

    render(<PriceTrendBadge priceHistory={info} />);

    expect(screen.getByText("近期低价")).toBeTruthy();
    expect(screen.getByText("历史最低 ¥17.50")).toBeTruthy();
  });

  it("shows '价格偏高' pill with average price for high trend", () => {
    const info: PriceHistoryInfo = {
      trend: "high",
      currentPrice: 33.0,
      lowestPrice: 17.5,
      highestPrice: 35.0,
      averagePrice: 25.0,
    };

    render(<PriceTrendBadge priceHistory={info} />);

    expect(screen.getByText("价格偏高")).toBeTruthy();
    expect(screen.getByText("均价 ¥25.00")).toBeTruthy();
  });

  it("shows '价格适中' pill with average price for average trend", () => {
    const info: PriceHistoryInfo = {
      trend: "average",
      currentPrice: 25.0,
      lowestPrice: 17.5,
      highestPrice: 35.0,
      averagePrice: 25.0,
    };

    render(<PriceTrendBadge priceHistory={info} />);

    expect(screen.getByText("价格适中")).toBeTruthy();
    expect(screen.getByText("均价 ¥25.00")).toBeTruthy();
  });
});
