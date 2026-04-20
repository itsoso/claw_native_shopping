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
    expect(result.deliveryEta).toContain("明天");
  });

  it("detects self_operated seller from pageConfig.pType without DOM badge", () => {
    const html = `<!doctype html><html><head><title>Test</title></head><body>
      <script>var pageConfig = { product: { skuId: '123', pType: 1 } };</script>
      <div class="sku-name">Test Product</div>
      <div class="p-price"><span>99.00</span></div>
    </body></html>`;

    const result = parseJdProductPage(html);

    expect(result.sellerType).toBe("self_operated");
  });

  it("detects marketplace seller from pageConfig.pType=2", () => {
    const html = `<!doctype html><html><head><title>Test</title></head><body>
      <script>var pageConfig = { product: { skuId: '456', pType: 2 } };</script>
      <div class="sku-name">Marketplace Product</div>
      <div class="p-price"><span>50.00</span></div>
    </body></html>`;

    const result = parseJdProductPage(html);

    expect(result.sellerType).toBe("marketplace");
  });

  it("falls back to DOM badge detection when pageConfig is absent", () => {
    const html = `<!doctype html><html><head><title>Test</title></head><body>
      <div class="sku-name">Badge Product</div>
      <div class="p-price"><span>30.00</span></div>
      <div class="u-jd">京东自营</div>
    </body></html>`;

    const result = parseJdProductPage(html);

    expect(result.sellerType).toBe("self_operated");
  });
});
