// @vitest-environment jsdom

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "../../apps/web/src/app/App.js";

describe("App shell", () => {
  it("renders a household-first heading and both scenario tabs", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: "你的冰箱正在等待下一次自动补货",
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("tab", { name: "家庭冰箱补货", selected: true }),
    ).toBeTruthy();
    expect(screen.getByRole("tab", { name: "办公室 / 门店补货" })).toBeTruthy();
  });
});
