// @vitest-environment jsdom

import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { DecisionCard } from "../../../apps/browser-extension/src/ui/DecisionCard.js";

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
});
