// @vitest-environment jsdom

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "../../apps/web/src/App.js";

describe("Web validation shell", () => {
  it("renders the thesis, household need context, and trust guardrails before any run", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: /OpenClaw 不是帮你搜商品，而是替你完成补货决策/i,
      }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "开始演示" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "为什么现在要补货" })).toBeTruthy();
    expect(screen.getByText("鸡蛋剩余 2 枚")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "代理守护规则" })).toBeTruthy();
    expect(screen.getByText("单次预算不超过 45 元")).toBeTruthy();
    expect(screen.getByRole("button", { name: "查看联调与运行状态" })).toBeTruthy();
  });
});
