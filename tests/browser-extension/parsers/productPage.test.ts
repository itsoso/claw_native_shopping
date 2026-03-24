import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { DOMParser } from "linkedom";

import { parseJdProductPage } from "../../../apps/browser-extension/src/parsers/productPage.js";

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
});
