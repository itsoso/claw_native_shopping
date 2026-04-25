// @vitest-environment jsdom

import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { PriceDropDialog } from "../../../apps/browser-extension/src/ui/PriceDropDialog.js";
import type { PriceDrop } from "../../../apps/browser-extension/src/types/priceDrop.js";

const SAMPLE: PriceDrop = {
  skuId: "100001",
  title: "立白 洗衣液 2kg",
  paidPrice: 100,
  currentPrice: 80,
  droppedBy: 20,
  url: "https://item.jd.com/100001.html",
  sellerType: "self_operated",
  detectedAt: 1700000000,
};

describe("PriceDropDialog", () => {
  it("renders each drop with paid → current price and 可退 amount", () => {
    render(
      <PriceDropDialog
        drops={[SAMPLE]}
        onApply={vi.fn()}
        onDismiss={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("立白 洗衣液 2kg")).toBeTruthy();
    expect(screen.getByText(/购入 ¥100\.00/)).toBeTruthy();
    expect(screen.getByText(/现 ¥80\.00/)).toBeTruthy();
    expect(screen.getByText(/可退 ¥20\.00/)).toBeTruthy();
  });

  it("shows total saved across drops in the subtitle", () => {
    const second: PriceDrop = { ...SAMPLE, skuId: "200002", title: "B", droppedBy: 15 };

    render(
      <PriceDropDialog
        drops={[SAMPLE, second]}
        onApply={vi.fn()}
        onDismiss={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText(/共 2 件可申请价保，总差价 ¥35\.00/)).toBeTruthy();
  });

  it("shows an empty-state message when there are no drops", () => {
    render(
      <PriceDropDialog
        drops={[]}
        onApply={vi.fn()}
        onDismiss={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText(/暂无降价提醒/)).toBeTruthy();
    expect(screen.getByText(/标记已购/)).toBeTruthy();
  });

  it("invokes onApply with the corresponding drop", () => {
    const onApply = vi.fn();

    render(
      <PriceDropDialog
        drops={[SAMPLE]}
        onApply={onApply}
        onDismiss={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    screen.getByRole("button", { name: "去申请价保" }).click();
    expect(onApply).toHaveBeenCalledWith(SAMPLE);
  });

  it("invokes onDismiss when 忽略 is clicked", () => {
    const onDismiss = vi.fn();

    render(
      <PriceDropDialog
        drops={[SAMPLE]}
        onApply={vi.fn()}
        onDismiss={onDismiss}
        onClose={vi.fn()}
      />,
    );

    screen.getByRole("button", { name: "忽略" }).click();
    expect(onDismiss).toHaveBeenCalledWith(SAMPLE);
  });

  it("invokes onClose from the close button", () => {
    const onClose = vi.fn();

    render(
      <PriceDropDialog
        drops={[SAMPLE]}
        onApply={vi.fn()}
        onDismiss={vi.fn()}
        onClose={onClose}
      />,
    );

    screen.getByRole("button", { name: "关闭" }).click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not invoke onClose when clicking inside the dialog body", () => {
    const onClose = vi.fn();

    render(
      <PriceDropDialog
        drops={[SAMPLE]}
        onApply={vi.fn()}
        onDismiss={vi.fn()}
        onClose={onClose}
      />,
    );

    screen.getByRole("dialog").click();
    expect(onClose).not.toHaveBeenCalled();
  });
});
