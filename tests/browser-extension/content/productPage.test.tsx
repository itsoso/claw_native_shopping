// @vitest-environment jsdom

import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const preferenceMocks = vi.hoisted(() => ({
  getEffectiveMode: vi.fn(),
  savePreferences: vi.fn(),
}));

const eventMocks = vi.hoisted(() => ({
  recordEvent: vi.fn(),
}));

const viewedProductMocks = vi.hoisted(() => ({
  recordViewedProduct: vi.fn(),
}));

const asyncParserMocks = vi.hoisted(() => ({
  parseJdProductAsync: vi.fn(),
}));

const savingsMocks = vi.hoisted(() => ({
  addSavingsRecord: vi.fn(),
}));

const browserMock = vi.hoisted(() => {
  const sendMessage = vi.fn().mockResolvedValue({ success: true, data: [] });
  (globalThis as unknown as Record<string, unknown>).browser = {
    runtime: { sendMessage },
  };
  return { sendMessage };
});

vi.mock(
  "../../../apps/browser-extension/src/storage/preferences.js",
  () => ({
    getEffectiveMode: preferenceMocks.getEffectiveMode,
    savePreferences: preferenceMocks.savePreferences,
  }),
);

vi.mock("../../../apps/browser-extension/src/storage/events.js", () => ({
  recordEvent: eventMocks.recordEvent,
}));

vi.mock(
  "../../../apps/browser-extension/src/storage/viewedProducts.js",
  () => ({
    recordViewedProduct: viewedProductMocks.recordViewedProduct,
  }),
);

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

vi.mock(
  "../../../apps/browser-extension/src/storage/savingsRecords.js",
  () => ({
    addSavingsRecord: savingsMocks.addSavingsRecord,
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
    preferenceMocks.getEffectiveMode.mockReset();
    preferenceMocks.savePreferences.mockReset();
    eventMocks.recordEvent.mockReset();
    asyncParserMocks.parseJdProductAsync.mockReset();
    viewedProductMocks.recordViewedProduct.mockReset();
    viewedProductMocks.recordViewedProduct.mockResolvedValue(undefined);
    savingsMocks.addSavingsRecord.mockReset();
    savingsMocks.addSavingsRecord.mockResolvedValue(undefined);
    browserMock.sendMessage.mockReset();
    browserMock.sendMessage.mockResolvedValue({ success: true, data: [] });
  });

  it("shows loading state while parsing", async () => {
    preferenceMocks.getEffectiveMode.mockResolvedValue({ mode: "safe", auto: false, autoReason: null });
    eventMocks.recordEvent.mockResolvedValue(undefined);
    asyncParserMocks.parseJdProductAsync.mockReturnValue(new Promise(() => {}));

    render(<ProductPagePanel />);

    expect(screen.getByText("正在分析页面...")).toBeTruthy();
  });

  it("shows decision card after successful parse", async () => {
    preferenceMocks.getEffectiveMode.mockResolvedValue({ mode: "safe", auto: false, autoReason: null });
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
    preferenceMocks.getEffectiveMode.mockResolvedValue({ mode: "value", auto: false, autoReason: null });
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
    preferenceMocks.getEffectiveMode.mockResolvedValue({ mode: "value", auto: false, autoReason: null });
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
    preferenceMocks.getEffectiveMode.mockResolvedValue({ mode: "safe", auto: false, autoReason: null });
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
    preferenceMocks.getEffectiveMode.mockResolvedValue({ mode: "safe", auto: false, autoReason: null });
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
    preferenceMocks.getEffectiveMode.mockResolvedValue({ mode: "safe", auto: false, autoReason: null });
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

  it("records savings when applying a cheaper alternative suggestion", async () => {
    preferenceMocks.getEffectiveMode.mockResolvedValue({ mode: "value", auto: false, autoReason: null });
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

    await waitFor(() => {
      expect(savingsMocks.addSavingsRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "奥妙 洗衣液 2kg",
          originalPrice: 29.9,
          savedPrice: 19.9,
          savedAmount: 10,
          url: "https://item.jd.com/200001.html",
        }),
      );
    });

    openSpy.mockRestore();
  });

  it("uses effectivePrice for savings when promotions exist", async () => {
    preferenceMocks.getEffectiveMode.mockResolvedValue({ mode: "value", auto: false, autoReason: null });
    preferenceMocks.savePreferences.mockResolvedValue(undefined);
    eventMocks.recordEvent.mockResolvedValue(undefined);

    const promoModel = {
      ...MOCK_MODEL,
      unitPrice: 199,
      effectivePrice: 99,
      promotions: {
        rules: [{ type: "manjian" as const, threshold: 199, discount: 100, label: "满199减100" }],
        coupons: [],
      },
    };

    const cheaperAlternative = {
      title: "奥妙 洗衣液 2kg",
      unitPrice: 80,
      sellerType: "marketplace" as const,
      deliveryEta: null,
      packageLabel: null,
    };

    asyncParserMocks.parseJdProductAsync.mockResolvedValue({
      model: promoModel,
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

    await waitFor(() => {
      expect(savingsMocks.addSavingsRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          originalPrice: 99,
          savedPrice: 80,
          savedAmount: 19,
        }),
      );
    });

    openSpy.mockRestore();
  });
});
