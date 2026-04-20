// @vitest-environment jsdom

import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { ParserStatusCard } from "../../../apps/browser-extension/src/ui/ParserStatusCard.js";

describe("ParserStatusCard", () => {
  it("shows loading message", () => {
    render(<ParserStatusCard status="loading" message="正在分析页面..." />);

    expect(screen.getByText("正在分析页面...")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "重试" })).toBeNull();
  });

  it("shows error message with retry button", () => {
    const onRetry = vi.fn();
    render(
      <ParserStatusCard status="error" message="解析失败" onRetry={onRetry} />,
    );

    expect(screen.getByText("解析失败")).toBeTruthy();

    const retryBtn = screen.getByRole("button", { name: "重试" });
    expect(retryBtn).toBeTruthy();

    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("hides retry button when onRetry is not provided", () => {
    render(<ParserStatusCard status="error" message="错误" />);

    expect(screen.queryByRole("button", { name: "重试" })).toBeNull();
  });
});
