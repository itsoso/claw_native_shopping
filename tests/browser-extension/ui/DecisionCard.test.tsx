// @vitest-environment jsdom

import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { DecisionCard } from "../../../apps/browser-extension/src/ui/DecisionCard.js";
import type { DecisionExplanation } from "../../../apps/browser-extension/src/types/recommendation.js";

describe("DecisionCard", () => {
  it("renders the recommendation, available actions, and mode switcher", () => {
    const onModeChange = vi.fn();
    const onApply = vi.fn();
    const onReasonView = vi.fn();
    const onPreferenceAction = vi.fn();

    render(
      <DecisionCard
        primaryAction="建议改选自营：立白洗衣液 2kg"
        reason="自营，明天送达，更省时间"
        mode="time_saving"
        onModeChange={onModeChange}
        footerActions={[
          { label: "应用建议", onClick: onApply },
          { label: "查看原因", onClick: onReasonView },
          { label: "调整偏好", onClick: onPreferenceAction },
        ]}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "建议改选自营：立白洗衣液 2kg",
      }),
    ).toBeTruthy();
    expect(screen.getByText("自营，明天送达，更省时间")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "应用建议" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "查看原因" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "调整偏好" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "更省时间", pressed: true }),
    ).toBeTruthy();

    screen.getByRole("button", { name: "应用建议" }).click();
    expect(onApply).toHaveBeenCalledTimes(1);

    screen.getByRole("button", { name: "查看原因" }).click();
    expect(onReasonView).toHaveBeenCalledTimes(1);

    screen.getByRole("button", { name: "调整偏好" }).click();
    expect(onPreferenceAction).toHaveBeenCalledTimes(1);

    screen.getByRole("button", { name: "更稳妥" }).click();
    expect(onModeChange).toHaveBeenCalledWith("safe");
  });

  it("hides the breakdown panel by default when explanation is provided", () => {
    const explanation: DecisionExplanation = {
      mode: "value",
      factors: [{ kind: "price", label: "到手价 ¥65.00" }],
      alternatives: [],
    };

    render(
      <DecisionCard
        primaryAction="保留当前商品"
        reason="自营，到手价 65 元"
        explanation={explanation}
      />,
    );

    expect(screen.queryByText("推荐依据")).toBeNull();
    expect(screen.queryByText("到手价 ¥65.00")).toBeNull();
  });

  it("renders the breakdown panel when showExplanation is true", () => {
    const explanation: DecisionExplanation = {
      mode: "value",
      factors: [
        { kind: "price", label: "到手价 ¥65.00" },
        { kind: "seller", label: "京东自营" },
      ],
      alternatives: [
        {
          title: "替代品X",
          priceDelta: 5,
          deliveryDelta: 0,
          sameSellerType: true,
        },
      ],
    };

    render(
      <DecisionCard
        primaryAction="保留当前商品"
        reason="自营，到手价 65 元"
        explanation={explanation}
        showExplanation
      />,
    );

    expect(screen.getByText("推荐依据")).toBeTruthy();
    expect(screen.getByText("到手价 ¥65.00")).toBeTruthy();
    expect(screen.getByText("京东自营")).toBeTruthy();
    expect(screen.getByText("对比替代品")).toBeTruthy();
    expect(screen.getByText("vs 替代品X")).toBeTruthy();
  });

  it("does not render the panel when showExplanation is true but explanation is missing", () => {
    render(
      <DecisionCard
        primaryAction="保留当前商品"
        reason="自营，到手价 65 元"
        showExplanation
      />,
    );

    expect(screen.queryByText("推荐依据")).toBeNull();
  });

  it("renders the auto-mode hint when autoModeHint is provided", () => {
    render(
      <DecisionCard
        primaryAction="保留当前商品"
        reason="自营，明天送达"
        mode="safe"
        onModeChange={vi.fn()}
        autoModeHint="你最近常看京东自营，推荐「更稳妥」"
      />,
    );

    expect(
      screen.getByText("你最近常看京东自营，推荐「更稳妥」"),
    ).toBeTruthy();
  });

  it("does not render an auto-mode hint when autoModeHint is absent", () => {
    const { container } = render(
      <DecisionCard
        primaryAction="保留当前商品"
        reason="自营，明天送达"
        mode="safe"
        onModeChange={vi.fn()}
      />,
    );

    expect(container.textContent).not.toContain("推荐「更稳妥」");
  });
});
