import type { CSSProperties } from "react";

import type { PriceHistoryInfo, PriceTrend } from "../types/product.js";

type PriceTrendBadgeProps = {
  priceHistory: PriceHistoryInfo;
};

const trendColors: Record<PriceTrend, string> = {
  low: "#2d7a3a",
  average: "#8b6914",
  high: "#9c3a2e",
};

const trendBackgrounds: Record<PriceTrend, string> = {
  low: "rgba(45, 122, 58, 0.12)",
  average: "rgba(139, 105, 20, 0.12)",
  high: "rgba(156, 58, 46, 0.12)",
};

const trendLabels: Record<PriceTrend, string> = {
  low: "近期低价",
  average: "价格适中",
  high: "价格偏高",
};

const containerStyle: CSSProperties = {
  margin: "0 0 10px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

export function PriceTrendBadge({ priceHistory }: PriceTrendBadgeProps) {
  const { trend, lowestPrice, averagePrice } = priceHistory;

  const pillStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 10px",
    borderRadius: "20px",
    background: trendBackgrounds[trend],
    color: trendColors[trend],
    fontSize: "12px",
    fontWeight: 700,
    lineHeight: 1,
  };

  const detailText =
    trend === "low"
      ? `历史最低 ¥${lowestPrice.toFixed(2)}`
      : `均价 ¥${averagePrice.toFixed(2)}`;

  const detailStyle: CSSProperties = {
    fontSize: "12px",
    color: "#6b5a48",
  };

  return (
    <div style={containerStyle}>
      <span style={pillStyle}>{trendLabels[trend]}</span>
      <span style={detailStyle}>{detailText}</span>
    </div>
  );
}
