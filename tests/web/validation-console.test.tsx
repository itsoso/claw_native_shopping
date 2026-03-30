// @vitest-environment jsdom

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "../../apps/web/src/App.js";

describe("validation console", () => {
  it("runs the default scenario and shows timeline steps and ops state", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "开始演示" }));

    await waitFor(() => {
      expect(screen.getByText("需求触发")).toBeTruthy();
      expect(screen.getByText("策略判断")).toBeTruthy();
      expect(screen.getByText("当前路径")).toBeTruthy();
      expect(screen.getByRole("button", { name: "演示模式" })).toBeTruthy();
    });
  });
});
