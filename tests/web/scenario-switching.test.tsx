// @vitest-environment jsdom

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { App } from "../../apps/web/src/app/App.js";
import type { DemoApiClient } from "../../apps/web/src/lib/types.js";

const createClient = (): DemoApiClient => ({
  runReplenishment: vi.fn(),
  fetchOrderExplanation: vi.fn()
});

describe("scenario switching", () => {
  it("switches visible inventory and call-to-action copy for office replenishment", () => {
    render(<App client={createClient()} />);

    fireEvent.click(screen.getByRole("tab", { name: "办公室 / 门店补货" }));

    expect(screen.getByText("咖啡豆")).toBeTruthy();
    expect(screen.getByText("瓶装水")).toBeTruthy();
    expect(screen.getByText("清洁喷雾")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "为办公室发起自动补货" })
    ).toBeTruthy();
  });
});
