// @vitest-environment jsdom

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

const asyncParserMocks = vi.hoisted(() => ({
  parseJdProductAsync: vi.fn(),
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

vi.mock(
  "../../../apps/browser-extension/src/parsers/asyncProductParser.js",
  () => ({
    parseJdProductAsync: asyncParserMocks.parseJdProductAsync,
  }),
);

vi.mock(
  "../../../apps/browser-extension/src/recommendation/fetchVerification.js",
  () => ({
    fetchVerification: vi.fn().mockResolvedValue(null),
  }),
);

vi.mock(
  "../../../apps/browser-extension/src/parsers/fetchPriceHistory.js",
  () => ({
    requestPriceHistory: vi.fn().mockResolvedValue(null),
  }),
);

import { ProductPagePanel } from "../../../apps/browser-extension/src/content/productPage.js";

const MOCK_MODEL = {
  title: "立白 洗衣液 2kg",
  unitPrice: 29.9,
  sellerType: "self_operated" as const,
  deliveryEta: "明天送达",
  packageLabel: "2kg",
};

describe("ProductPagePanel", () => {
  beforeEach(() => {
    preferenceMocks.loadPreferences.mockReset();
    preferenceMocks.savePreferences.mockReset();
    eventMocks.recordEvent.mockReset();
    asyncParserMocks.parseJdProductAsync.mockReset();
  });

  it("shows loading state while parsing", async () => {
    preferenceMocks.loadPreferences.mockResolvedValue({ mode: "safe" });
    eventMocks.recordEvent.mockResolvedValue(undefined);
    asyncParserMocks.parseJdProductAsync.mockReturnValue(new Promise(() => {}));

    render(<ProductPagePanel />);

    expect(screen.getByText("正在分析页面...")).toBeTruthy();
  });

  it("shows decision card after successful parse", async () => {
    preferenceMocks.loadPreferences.mockResolvedValue({ mode: "safe" });
    preferenceMocks.savePreferences.mockResolvedValue(undefined);
    eventMocks.recordEvent.mockResolvedValue(undefined);
    asyncParserMocks.parseJdProductAsync.mockResolvedValue({
      model: MOCK_MODEL,
      alternatives: [],
      alternativeUrls: {},
      incomplete: false,
    });

    render(<ProductPagePanel />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: "保留当前商品：立白 洗衣液 2kg",
        }),
      ).toBeTruthy();
    });

    expect(screen.getByText(/自营.*明天.*更稳妥/)).toBeTruthy();
  });

  it("shows alternative suggestion when a better product exists", async () => {
    preferenceMocks.loadPreferences.mockResolvedValue({ mode: "value" });
    preferenceMocks.savePreferences.mockResolvedValue(undefined);
    eventMocks.recordEvent.mockResolvedValue(undefined);

    const cheaperAlternative = {
      title: "奥妙 洗衣液 2kg",
      unitPrice: 19.9,
      sellerType: "marketplace" as const,
      deliveryEta: null,
      packageLabel: null,
    };

    asyncParserMocks.parseJdProductAsync.mockResolvedValue({
      model: MOCK_MODEL,
      alternatives: [cheaperAlternative],
      alternativeUrls: { "奥妙 洗衣液 2kg": "https://item.jd.com/200001.html" },
      incomplete: false,
    });

    render(<ProductPagePanel />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: /建议改选.*奥妙/,
        }),
      ).toBeTruthy();
    });
  });

  it("opens alternative URL when applying suggestion for a different product", async () => {
    preferenceMocks.loadPreferences.mockResolvedValue({ mode: "value" });
    preferenceMocks.savePreferences.mockResolvedValue(undefined);
    eventMocks.recordEvent.mockResolvedValue(undefined);

    const cheaperAlternative = {
      title: "奥妙 洗衣液 2kg",
      unitPrice: 19.9,
      sellerType: "marketplace" as const,
      deliveryEta: null,
      packageLabel: null,
    };

    asyncParserMocks.parseJdProductAsync.mockResolvedValue({
      model: MOCK_MODEL,
      alternatives: [cheaperAlternative],
      alternativeUrls: { "奥妙 洗衣液 2kg": "https://item.jd.com/200001.html" },
      incomplete: false,
    });

    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    render(<ProductPagePanel />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "应用建议" })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: "应用建议" }));

    expect(openSpy).toHaveBeenCalledWith("https://item.jd.com/200001.html", "_blank");
    openSpy.mockRestore();
  });

  it("shows error state when parse fails", async () => {
    preferenceMocks.loadPreferences.mockResolvedValue({ mode: "safe" });
    eventMocks.recordEvent.mockResolvedValue(undefined);
    asyncParserMocks.parseJdProductAsync.mockRejectedValue(
      new Error("parse failed"),
    );

    render(<ProductPagePanel />);

    await waitFor(() => {
      expect(screen.getByText(/页面解析失败/)).toBeTruthy();
    });

    expect(screen.getByRole("button", { name: "重试" })).toBeTruthy();
  });

  it("retries parsing when retry button is clicked", async () => {
    preferenceMocks.loadPreferences.mockResolvedValue({ mode: "safe" });
    eventMocks.recordEvent.mockResolvedValue(undefined);
    asyncParserMocks.parseJdProductAsync
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValueOnce({
        model: MOCK_MODEL,
        alternatives: [],
        alternativeUrls: {},
        incomplete: false,
      });

    render(<ProductPagePanel />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "重试" })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: "重试" }));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: "保留当前商品：立白 洗衣液 2kg",
        }),
      ).toBeTruthy();
    });

    expect(asyncParserMocks.parseJdProductAsync).toHaveBeenCalledTimes(2);
  });

  it("records interactions correctly after parse", async () => {
    preferenceMocks.loadPreferences.mockResolvedValue({ mode: "safe" });
    preferenceMocks.savePreferences.mockResolvedValue(undefined);
    eventMocks.recordEvent.mockResolvedValue(undefined);
    asyncParserMocks.parseJdProductAsync.mockResolvedValue({
      model: MOCK_MODEL,
      alternatives: [],
      alternativeUrls: {},
      incomplete: false,
    });

    render(<ProductPagePanel />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "更稳妥", pressed: true }),
      ).toBeTruthy();
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

    fireEvent.click(screen.getByRole("button", { name: "更划算" }));

    await waitFor(() => {
      expect(preferenceMocks.savePreferences).toHaveBeenCalledWith({
        mode: "value",
      });
    });
  });
});
