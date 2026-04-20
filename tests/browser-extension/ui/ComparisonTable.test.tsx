// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

import { ComparisonTable } from "../../../apps/browser-extension/src/ui/ComparisonTable.js";
import type { ProductPageModel } from "../../../apps/browser-extension/src/types/product.js";

const current: ProductPageModel = {
  title: "立白 洗衣液 2kg",
  unitPrice: 29.9,
  sellerType: "self_operated",
  deliveryEta: "明天送达",
  packageLabel: null,
};

const alternatives: ProductPageModel[] = [
  {
    title: "蓝月亮 洗衣液 3kg",
    unitPrice: 39.9,
    sellerType: "self_operated",
    deliveryEta: "后天送达",
    packageLabel: null,
  },
  {
    title: "奥妙 洗衣液 2kg",
    unitPrice: 19.9,
    sellerType: "marketplace",
    deliveryEta: null,
    packageLabel: null,
  },
];

describe("ComparisonTable", () => {
  it("renders current product and alternatives", () => {
    render(
      <ComparisonTable
        current={current}
        alternatives={alternatives}
        chosen={current}
        alternativeUrls={{}}
        mode="time_saving"
      />,
    );

    expect(screen.getByText("立白 洗衣液 2kg")).toBeTruthy();
    expect(screen.getByText("蓝月亮 洗衣液 3kg")).toBeTruthy();
    expect(screen.getByText("奥妙 洗衣液 2kg")).toBeTruthy();
  });

  it("shows price for each product", () => {
    render(
      <ComparisonTable
        current={current}
        alternatives={alternatives}
        chosen={current}
        alternativeUrls={{}}
        mode="time_saving"
      />,
    );

    expect(screen.getByText("¥29.90")).toBeTruthy();
    expect(screen.getByText("¥39.90")).toBeTruthy();
    expect(screen.getByText("¥19.90")).toBeTruthy();
  });

  it("shows seller type badges", () => {
    render(
      <ComparisonTable
        current={current}
        alternatives={alternatives}
        chosen={current}
        alternativeUrls={{}}
        mode="time_saving"
      />,
    );

    const selfBadges = screen.getAllByText("自营");
    expect(selfBadges.length).toBe(2);
    expect(screen.getByText("商家")).toBeTruthy();
  });

  it("marks current product with 当前 tag", () => {
    render(
      <ComparisonTable
        current={current}
        alternatives={alternatives}
        chosen={current}
        alternativeUrls={{}}
        mode="time_saving"
      />,
    );

    expect(screen.getByText("当前")).toBeTruthy();
  });

  it("marks chosen product with 推荐 tag", () => {
    render(
      <ComparisonTable
        current={current}
        alternatives={alternatives}
        chosen={alternatives[1]!}
        alternativeUrls={{}}
        mode="value"
      />,
    );

    expect(screen.getByText("推荐")).toBeTruthy();
  });

  it("renders alternative URLs as links", () => {
    render(
      <ComparisonTable
        current={current}
        alternatives={alternatives}
        chosen={current}
        alternativeUrls={{ "蓝月亮 洗衣液 3kg": "https://item.jd.com/200001.html" }}
        mode="time_saving"
      />,
    );

    const link = screen.getByText("蓝月亮 洗衣液 3kg");
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("https://item.jd.com/200001.html");
  });

  it("limits to 3 alternatives shown", () => {
    const manyAlts = Array.from({ length: 5 }, (_, i) => ({
      title: `Product ${i}`,
      unitPrice: 10 + i,
      sellerType: "marketplace" as const,
      deliveryEta: null,
      packageLabel: null,
    }));

    render(
      <ComparisonTable
        current={current}
        alternatives={manyAlts}
        chosen={current}
        alternativeUrls={{}}
        mode="time_saving"
      />,
    );

    expect(screen.getByText("Product 0")).toBeTruthy();
    expect(screen.getByText("Product 1")).toBeTruthy();
    expect(screen.getByText("Product 2")).toBeTruthy();
    expect(screen.queryByText("Product 3")).toBeNull();
    expect(screen.queryByText("Product 4")).toBeNull();
  });
});
