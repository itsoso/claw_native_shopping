import { describe, expect, it } from "vitest";
import { DOMParser } from "linkedom";

import {
  CART_SELECTORS,
  PRODUCT_SELECTORS,
  queryFirst,
  textOf,
} from "../../../apps/browser-extension/src/config/selectors.js";

globalThis.DOMParser = DOMParser as unknown as typeof globalThis.DOMParser;

describe("selector config", () => {
  it("product selectors have non-empty arrays for each field", () => {
    for (const [key, selectors] of Object.entries(PRODUCT_SELECTORS)) {
      expect(selectors.length, `PRODUCT_SELECTORS.${key}`).toBeGreaterThan(0);
    }
  });

  it("cart selectors have non-empty arrays for each field", () => {
    for (const [key, selectors] of Object.entries(CART_SELECTORS)) {
      expect(selectors.length, `CART_SELECTORS.${key}`).toBeGreaterThan(0);
    }
  });

  it("real JD selectors come before legacy fallbacks in product title", () => {
    expect(PRODUCT_SELECTORS.title[0]).toBe(".sku-name");
  });

  it("real JD selectors come before legacy fallbacks in cart items", () => {
    expect(CART_SELECTORS.item[0]).toBe(".item-form");
  });
});

describe("queryFirst", () => {
  it("returns null for an empty selector list", () => {
    const doc = new DOMParser().parseFromString("<div></div>", "text/html");
    expect(queryFirst(doc, [])).toBeNull();
  });
});

describe("textOf", () => {
  it("returns null when no selector matches", () => {
    const doc = new DOMParser().parseFromString("<div></div>", "text/html");
    expect(textOf(doc, [".missing"])).toBeNull();
  });
});
