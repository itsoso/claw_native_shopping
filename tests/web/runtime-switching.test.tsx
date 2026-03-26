// @vitest-environment jsdom

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "../../apps/web/src/App.js";

describe("runtime switching", () => {
  it("shows a clear live-mode failure state without breaking demo mode", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Live" }));
    fireEvent.click(screen.getByRole("button", { name: "开始演示" }));

    await waitFor(() => {
      expect(screen.getByText(/服务不可用/i)).toBeTruthy();
      expect(screen.getByText("Demo")).toBeTruthy();
    });
  });
});
