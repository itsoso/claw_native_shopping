// @vitest-environment jsdom

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { liveRunMock } = vi.hoisted(() => ({
  liveRunMock: vi.fn().mockRejectedValue(new Error("seller-sim /health failed with HTTP 503")),
}));

vi.mock("../../apps/web/src/runtime/liveRuntime.js", () => ({
  createLiveRuntime: () => ({
    run: liveRunMock,
  }),
}));

import { App } from "../../apps/web/src/App.js";

describe("runtime switching", () => {
  it("shows a clear live-mode failure state without breaking demo mode", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "联调模式" }));
    fireEvent.click(screen.getByRole("button", { name: "开始演示" }));

    await waitFor(() => {
      expect(screen.getByText(/服务不可用/i)).toBeTruthy();
      expect(screen.getByText("当前路径")).toBeTruthy();
      expect(screen.getByRole("button", { name: "演示模式" })).toBeTruthy();
      expect(screen.getByText(/seller-sim \/health failed with HTTP 503/)).toBeTruthy();
    });
  });
});
