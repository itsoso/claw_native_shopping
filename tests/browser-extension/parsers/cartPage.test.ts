import { readFileSync } from "node:fs";

import { DOMParser } from "linkedom";
import { describe, expect, it } from "vitest";

import { parseJdCartPage } from "../../../apps/browser-extension/src/parsers/cartPage.js";

globalThis.DOMParser = DOMParser as unknown as typeof globalThis.DOMParser;

describe("parseJdCartPage", () => {
  it("extracts cart items and threshold rules from a JD cart fixture", () => {
    const html = readFileSync(
      "tests/browser-extension/fixtures/jd/cart-page.html",
      "utf8",
    );

    const result = parseJdCartPage(html);

    expect(result.items).toHaveLength(2);
    expect(result.items[0]?.title).toContain("洗衣液");
    expect(result.items[0]?.unitPrice).toBe(29.9);
    expect(result.items[1]?.sellerType).toBe("self_operated");
    expect(result.items[1]?.unitPrice).toBe(12);
    expect(result.thresholdRules).toHaveLength(1);
    expect(result.thresholdRules[0]?.threshold).toBe(59);
    expect(result.thresholdRules[0]?.discount).toBe(10);
  });

  it("parses threshold rules from 满减 text when no data attributes exist", () => {
    const html = `<!doctype html><html><body>
      <div class="item-form">
        <div class="p-name"><a>Test Item</a></div>
        <div class="p-price"><strong>50.00</strong></div>
        <div class="quantity-form"><input value="2" /></div>
      </div>
      <div class="prom-main"><span>满99减20，满199减50</span></div>
    </body></html>`;

    const result = parseJdCartPage(html);

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.quantity).toBe(2);
    expect(result.thresholdRules).toHaveLength(2);
    expect(result.thresholdRules[0]?.threshold).toBe(99);
    expect(result.thresholdRules[0]?.discount).toBe(20);
    expect(result.thresholdRules[1]?.threshold).toBe(199);
    expect(result.thresholdRules[1]?.discount).toBe(50);
  });
});
