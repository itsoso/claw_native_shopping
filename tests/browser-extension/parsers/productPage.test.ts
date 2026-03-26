import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { DOMParser } from "linkedom";

import {
  parseJdProductDocument,
  parseJdProductPage,
} from "../../../apps/browser-extension/src/parsers/productPage.js";

globalThis.DOMParser = DOMParser as unknown as typeof globalThis.DOMParser;

describe("parseJdProductPage", () => {
  it("extracts the core purchase fields from a JD product fixture", () => {
    const html = readFileSync(
      "tests/browser-extension/fixtures/jd/product-page.html",
      "utf8",
    );

    const result = parseJdProductPage(html);

    expect(result.title).toContain("洗衣液");
    expect(result.unitPrice).toBeGreaterThan(0);
    expect(result.sellerType).toBe("self_operated");
    expect(result.deliveryEta).toBeTruthy();
    expect(result.packageLabel).toBe("2kg");
  });

  it("can parse directly from an existing document without reparsing HTML", () => {
    const html = readFileSync(
      "tests/browser-extension/fixtures/jd/product-page.html",
      "utf8",
    );
    const document = new DOMParser().parseFromString(html, "text/html");

    const result = parseJdProductDocument(document);

    expect(result.title).toBe("立白 洗衣液 2kg");
    expect(result.unitPrice).toBe(29.9);
    expect(result.sellerType).toBe("self_operated");
    expect(result.deliveryEta).toBe("明天 送达");
    expect(result.packageLabel).toBe("2kg");
  });
});
