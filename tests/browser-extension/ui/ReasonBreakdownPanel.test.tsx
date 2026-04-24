// @vitest-environment jsdom

import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { ReasonBreakdownPanel } from "../../../apps/browser-extension/src/ui/ReasonBreakdownPanel.js";
import type { DecisionExplanation } from "../../../apps/browser-extension/src/types/recommendation.js";

describe("ReasonBreakdownPanel", () => {
  it("renders each factor with its label and optional detail", () => {
    const explanation: DecisionExplanation = {
      mode: "value",
      factors: [
        { kind: "price", label: "到手价 ¥65.00", detail: "标价 ¥100.00" },
        { kind: "seller", label: "京东自营" },
        { kind: "price_history", label: "近 30 天低价", detail: "当前 ¥65.00，历史最低 ¥60.00" },
        { kind: "promotion", label: "促销合计省 ¥35.00", detail: "满99减10 + 满99减25券" },
      ],
      alternatives: [],
    };

    render(<ReasonBreakdownPanel explanation={explanation} />);

    expect(screen.getByText("到手价 ¥65.00")).toBeTruthy();
    expect(screen.getByText("标价 ¥100.00")).toBeTruthy();
    expect(screen.getByText("京东自营")).toBeTruthy();
    expect(screen.getByText("近 30 天低价")).toBeTruthy();
    expect(screen.getByText("当前 ¥65.00，历史最低 ¥60.00")).toBeTruthy();
    expect(screen.getByText("促销合计省 ¥35.00")).toBeTruthy();
    expect(screen.getByText("满99减10 + 满99减25券")).toBeTruthy();
  });

  it("summarizes alternative comparisons with price, delivery, and seller deltas", () => {
    const explanation: DecisionExplanation = {
      mode: "time_saving",
      factors: [{ kind: "seller", label: "京东自营" }],
      alternatives: [
        {
          title: "替代品A",
          priceDelta: 2.0, // chosen is pricier
          deliveryDelta: 1, // chosen is faster by 1 rank
          sameSellerType: false,
        },
        {
          title: "替代品B",
          priceDelta: -5.0, // chosen is cheaper
          deliveryDelta: 0,
          sameSellerType: true,
        },
      ],
    };

    render(<ReasonBreakdownPanel explanation={explanation} />);

    expect(screen.getByText("vs 替代品A")).toBeTruthy();
    expect(
      screen.getByText(/贵 ¥2\.00.*物流领先 1.*卖家类型不同/),
    ).toBeTruthy();

    expect(screen.getByText("vs 替代品B")).toBeTruthy();
    expect(screen.getByText(/更便宜 ¥5\.00/)).toBeTruthy();
  });

  it("renders a fallback message when no factors or alternatives exist", () => {
    const explanation: DecisionExplanation = {
      mode: "safe",
      factors: [],
      alternatives: [],
    };

    render(<ReasonBreakdownPanel explanation={explanation} />);

    expect(
      screen.getByText("本次仅基于标价推荐，暂无更多可解释数据。"),
    ).toBeTruthy();
  });

  it("omits the alternatives section when alternatives is empty but factors exist", () => {
    const explanation: DecisionExplanation = {
      mode: "value",
      factors: [{ kind: "price", label: "标价 ¥29.90" }],
      alternatives: [],
    };

    render(<ReasonBreakdownPanel explanation={explanation} />);

    expect(screen.getByText("推荐依据")).toBeTruthy();
    expect(screen.queryByText("对比替代品")).toBeNull();
  });
});
