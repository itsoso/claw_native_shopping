// @vitest-environment jsdom

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "../../apps/web/src/App.js";

describe("Web validation shell", () => {
  it("renders the thesis and the primary demo call to action", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: /OpenClaw 不是帮你搜商品，而是替你完成补货决策/i,
      }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "开始演示" })).toBeTruthy();
  });
});
