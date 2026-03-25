// @vitest-environment jsdom

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { App } from "../../apps/web/src/app/App.js";
import type { DemoApiClient } from "../../apps/web/src/lib/types.js";

const createClient = (): DemoApiClient => ({
  runReplenishment: vi.fn(),
  fetchOrderExplanation: vi.fn()
});

describe("home dashboard", () => {
  it("renders the default household inventory pressure panel and policy summary", () => {
    render(<App client={createClient()} />);

    expect(screen.getByText("库存压力")).toBeTruthy();
    expect(screen.getByText("鸡蛋")).toBeTruthy();
    expect(screen.getByText("牛奶")).toBeTruthy();
    expect(screen.getByText("厨房纸")).toBeTruthy();
    expect(screen.getByText("预算 50 元内自动执行，超出时请求确认")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "为这个家发起自动补货" })
    ).toBeTruthy();
  });
});
