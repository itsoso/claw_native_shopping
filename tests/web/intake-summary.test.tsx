// @vitest-environment jsdom

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App } from "../../apps/web/src/App.js";

describe("release intake summary", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads the recent feedback pulse when the intake area becomes visible", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      if (typeof input === "string" && input.endsWith("/intake/summary")) {
        return new Response(
          JSON.stringify({
            feedbackCount: 4,
            interestCount: 7,
            recentFeedback: [
              {
                scenarioId: "replenish-laundry",
                message: "我想先看到更真实的商品推荐。",
                recordedAt: "2026-03-30T10:00:00.000Z",
              },
            ],
          }),
        );
      }

      return new Response(JSON.stringify({ accepted: true }));
    });

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "开始演示" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "最近的反馈信号" })).toBeTruthy();
      expect(screen.getByText("4 条反馈")).toBeTruthy();
      expect(screen.getByText("7 人候补")).toBeTruthy();
      expect(screen.getByText("我想先看到更真实的商品推荐。")).toBeTruthy();
    });
  });
});
