// @vitest-environment jsdom

import { readFileSync } from "node:fs";

import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const preferenceMocks = vi.hoisted(() => ({
  loadPreferences: vi.fn(),
  savePreferences: vi.fn(),
}));

const eventMocks = vi.hoisted(() => ({
  recordEvent: vi.fn(),
}));

vi.mock(
  "../../../apps/browser-extension/src/storage/preferences.js",
  () => ({
    loadPreferences: preferenceMocks.loadPreferences,
    savePreferences: preferenceMocks.savePreferences,
  }),
);

vi.mock("../../../apps/browser-extension/src/storage/events.js", () => ({
  recordEvent: eventMocks.recordEvent,
}));

import { ProductPagePanel } from "../../../apps/browser-extension/src/content/productPage.js";

describe("ProductPagePanel", () => {
  beforeEach(() => {
    preferenceMocks.loadPreferences.mockReset();
    preferenceMocks.savePreferences.mockReset();
    eventMocks.recordEvent.mockReset();
    document.body.innerHTML = readFileSync(
      "tests/browser-extension/fixtures/jd/product-page.html",
      "utf8",
    );
  });

  it("loads the saved mode from storage, derives the recommendation from the JD DOM, and records interactions", async () => {
    preferenceMocks.loadPreferences.mockResolvedValue({ mode: "safe" });
    preferenceMocks.savePreferences.mockResolvedValue(undefined);
    eventMocks.recordEvent.mockResolvedValue(undefined);

    render(<ProductPagePanel />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "更稳妥", pressed: true }),
      ).toBeTruthy();
    });

    expect(
      screen.getByRole("heading", {
        name: "保留当前商品：立白 洗衣液 2kg",
      }),
    ).toBeTruthy();
    expect(screen.getByText("自营，明天 送达，更稳妥")).toBeTruthy();

    await waitFor(() => {
      expect(eventMocks.recordEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "recommendation_shown",
          surface: "product_page",
          mode: "safe",
        }),
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "应用建议" }));

    await waitFor(() => {
      expect(eventMocks.recordEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "recommendation_applied",
          surface: "product_page",
          mode: "safe",
        }),
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "查看原因" }));

    await waitFor(() => {
      expect(eventMocks.recordEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "reason_viewed",
          surface: "product_page",
          mode: "safe",
        }),
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "更划算" }));

    await waitFor(() => {
      expect(preferenceMocks.savePreferences).toHaveBeenCalledWith({
        mode: "value",
      });
      expect(eventMocks.recordEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "preference_changed",
          surface: "product_page",
          mode: "value",
        }),
      );
    });
  });
});
