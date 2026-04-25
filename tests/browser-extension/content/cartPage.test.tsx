// @vitest-environment jsdom

import { readFileSync } from "node:fs";

import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const eventMocks = vi.hoisted(() => ({
  recordEvent: vi.fn(),
}));

const priceDropMocks = vi.hoisted(() => ({
  readActivePriceDrops: vi.fn(),
  dismissPriceDrop: vi.fn(),
}));

vi.mock("../../../apps/browser-extension/src/storage/events.js", () => ({
  recordEvent: eventMocks.recordEvent,
}));

vi.mock(
  "../../../apps/browser-extension/src/storage/priceDrops.js",
  () => ({
    readActivePriceDrops: priceDropMocks.readActivePriceDrops,
    dismissPriceDrop: priceDropMocks.dismissPriceDrop,
  }),
);

import { CartPagePanel, toDecisionCardProps } from "../../../apps/browser-extension/src/content/cartPage.js";

describe("CartPagePanel", () => {
  beforeEach(() => {
    eventMocks.recordEvent.mockReset();
    eventMocks.recordEvent.mockResolvedValue(undefined);
    priceDropMocks.readActivePriceDrops.mockReset().mockResolvedValue([]);
    priceDropMocks.dismissPriceDrop.mockReset().mockResolvedValue(undefined);
    document.body.innerHTML = readFileSync(
      "tests/browser-extension/fixtures/jd/cart-page.html",
      "utf8",
    );
  });

  it("records cart plan events and actions", async () => {
    render(<CartPagePanel />);

    await waitFor(() => {
      expect(eventMocks.recordEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "cart_plan_shown",
          surface: "cart_page",
        }),
      );
    });

    expect(
      screen.queryByRole("button", { name: "查看原因" }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: "调整偏好" }),
    ).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "应用建议" }));

    await waitFor(() => {
      expect(eventMocks.recordEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "cart_plan_applied",
          surface: "cart_page",
        }),
      );
    });
  });

  it("shows discount and effective total in reason when rule is satisfied", () => {
    const props = toDecisionCardProps({
      summary: "已满足满 99 减 30，可以直接结算。",
      actions: ["保持当前购物车并结算"],
      effectiveTotal: 69,
      discount: 30,
    });

    expect(props.reason).toContain("省 ¥30.00");
    expect(props.reason).toContain("到手 ¥69.00");
  });

  it("omits discount note when no rule satisfied", () => {
    const props = toDecisionCardProps({
      summary: "再补 20.00 元可满 99 减 30。",
      actions: ["加购 2 件「抽纸」凑单"],
    });

    expect(props.reason).not.toContain("省");
    expect(props.reason).not.toContain("到手");
  });

  it("renders 降价 N button when active drops exist and opens the dialog on click", async () => {
    priceDropMocks.readActivePriceDrops.mockResolvedValue([
      {
        skuId: "100001",
        title: "立白 洗衣液",
        paidPrice: 100,
        currentPrice: 80,
        droppedBy: 20,
        url: "https://item.jd.com/100001.html",
        sellerType: "self_operated",
        detectedAt: 1700000000,
      },
    ]);

    render(<CartPagePanel />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "降价 1" })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: "降价 1" }));

    expect(screen.getByRole("dialog", { name: "价保监控" })).toBeTruthy();
    await waitFor(() => {
      expect(eventMocks.recordEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "price_drop_dialog_opened",
          surface: "cart_page",
        }),
      );
    });
  });
});
