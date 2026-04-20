// @vitest-environment jsdom

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "../../apps/web/src/App.js";
import { DemoPage } from "../../apps/web/src/demo/DemoPage.js";
import { demoProducts } from "../../apps/web/src/demo/products.js";

describe("DemoPage", () => {
  it("renders all product tabs", () => {
    render(<DemoPage />);

    for (const product of demoProducts) {
      const shortName = product.title.split(" ")[0]!;
      expect(screen.getByRole("button", { name: new RegExp(shortName) })).toBeTruthy();
    }
  });

  it("shows verification badge for verified products", () => {
    render(<DemoPage />);

    expect(screen.getAllByText(/已验证/).length).toBeGreaterThan(0);
  });

  it("shows the comparison section", () => {
    render(<DemoPage />);

    expect(screen.getByText("有品质验证")).toBeTruthy();
    expect(screen.getByText("无品质验证")).toBeTruthy();
  });

  it("shows stats cards", () => {
    render(<DemoPage />);

    expect(screen.getByText("+34%")).toBeTruthy();
    expect(screen.getByText("92%")).toBeTruthy();
    expect(screen.getByText("4.8x")).toBeTruthy();
  });
});

describe("App view switching", () => {
  it("shows console by default and switches to demo view", () => {
    render(<App />);

    expect(screen.getByRole("button", { name: "开始演示" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "商品体验 Demo" }));

    expect(screen.getByText("OpenClaw 品质验证体验")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "开始演示" })).toBeNull();
  });

  it("switches back from demo to console", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "商品体验 Demo" }));
    expect(screen.getByText("OpenClaw 品质验证体验")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "验证控制台" }));
    expect(screen.getByRole("button", { name: "开始演示" })).toBeTruthy();
  });
});
