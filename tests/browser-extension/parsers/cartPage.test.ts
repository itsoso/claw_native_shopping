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
    expect(result.items[1]?.sellerType).toBe("self_operated");
    expect(result.thresholdRules).toHaveLength(1);
    expect(result.thresholdRules[0]?.threshold).toBe(59);
    expect(result.thresholdRules[0]?.discount).toBe(10);
  });
});
