// @vitest-environment jsdom

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "../../apps/web/src/App.js";

describe("validation console", () => {
  it("runs the default scenario and shows both timeline and concrete buying outcome", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "开始演示" }));

    await waitFor(() => {
      expect(screen.getByText("需求触发")).toBeTruthy();
      expect(screen.getByText("策略判断")).toBeTruthy();
      expect(screen.getByRole("heading", { name: "本次代理会这样买" })).toBeTruthy();
      expect(screen.getByText("散养鸡蛋 12 枚")).toBeTruthy();
      expect(screen.getByText("无需人工审批")).toBeTruthy();
      expect(screen.getByText("晨光农场直营网")).toBeTruthy();
      expect(screen.getByText("30 元")).toBeTruthy();
      expect(screen.getByText("明早 09:00 前送达")).toBeTruthy();
    });
  });
});
