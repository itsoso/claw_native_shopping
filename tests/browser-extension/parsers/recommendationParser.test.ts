import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { DOMParser } from "linkedom";

import { parseRecommendationItems } from "../../../apps/browser-extension/src/parsers/recommendationParser.js";

globalThis.DOMParser = DOMParser as unknown as typeof globalThis.DOMParser;

function parseHtml(html: string) {
  return new DOMParser().parseFromString(html, "text/html");
}

describe("parseRecommendationItems", () => {
  it("extracts alternatives from a JD product fixture with alsoBuy section", () => {
    const html = readFileSync(
      "tests/browser-extension/fixtures/jd/product-page.html",
      "utf8",
    );
    const doc = parseHtml(html);

    const { alternatives } = parseRecommendationItems(doc, "立白 洗衣液 2kg");

    expect(alternatives.length).toBe(2);
    expect(alternatives[0]!.title).toBe("蓝月亮 洗衣液 3kg");
    expect(alternatives[0]!.unitPrice).toBe(39.9);
    expect(alternatives[0]!.sellerType).toBe("self_operated");
    expect(alternatives[1]!.title).toBe("奥妙 洗衣液 2kg");
    expect(alternatives[1]!.unitPrice).toBe(24.5);
    expect(alternatives[1]!.sellerType).toBe("marketplace");
  });

  it("returns empty alternatives when no recommendation section exists", () => {
    const doc = parseHtml(
      "<!doctype html><html><body><div>no recs</div></body></html>",
    );

    const { alternatives } = parseRecommendationItems(doc);

    expect(alternatives).toEqual([]);
  });

  it("filters out items with no price", () => {
    const doc = parseHtml(`<!doctype html><html><body>
      <div id="alsoBuy"><div class="mc">
        <ul class="goods-list">
          <li class="gl-item">
            <div class="p-name"><a>Good Item</a></div>
            <div class="p-price"><i>19.90</i></div>
          </li>
          <li class="gl-item">
            <div class="p-name"><a>No Price Item</a></div>
          </li>
        </ul>
      </div></div>
    </body></html>`);

    const { alternatives } = parseRecommendationItems(doc);

    expect(alternatives.length).toBe(1);
    expect(alternatives[0]!.title).toBe("Good Item");
  });

  it("filters out items with no title", () => {
    const doc = parseHtml(`<!doctype html><html><body>
      <div id="alsoBuy"><div class="mc">
        <ul class="goods-list">
          <li class="gl-item">
            <div class="p-price"><i>19.90</i></div>
          </li>
        </ul>
      </div></div>
    </body></html>`);

    const { alternatives } = parseRecommendationItems(doc);

    expect(alternatives).toEqual([]);
  });

  it("deduplicates items by title", () => {
    const doc = parseHtml(`<!doctype html><html><body>
      <div id="alsoBuy"><div class="mc">
        <ul class="goods-list">
          <li class="gl-item">
            <div class="p-name"><a>Duplicate Item</a></div>
            <div class="p-price"><i>19.90</i></div>
          </li>
          <li class="gl-item">
            <div class="p-name"><a>Duplicate Item</a></div>
            <div class="p-price"><i>21.00</i></div>
          </li>
        </ul>
      </div></div>
    </body></html>`);

    const { alternatives } = parseRecommendationItems(doc);

    expect(alternatives.length).toBe(1);
  });

  it("excludes the current product by title", () => {
    const doc = parseHtml(`<!doctype html><html><body>
      <div id="alsoBuy"><div class="mc">
        <ul class="goods-list">
          <li class="gl-item">
            <div class="p-name"><a>Current Product</a></div>
            <div class="p-price"><i>29.90</i></div>
          </li>
          <li class="gl-item">
            <div class="p-name"><a>Different Product</a></div>
            <div class="p-price"><i>19.90</i></div>
          </li>
        </ul>
      </div></div>
    </body></html>`);

    const { alternatives } = parseRecommendationItems(doc, "Current Product");

    expect(alternatives.length).toBe(1);
    expect(alternatives[0]!.title).toBe("Different Product");
  });

  it("returns at most 5 alternatives", () => {
    const items = Array.from({ length: 8 }, (_, i) =>
      `<li class="gl-item">
        <div class="p-name"><a>Item ${i}</a></div>
        <div class="p-price"><i>${10 + i}.00</i></div>
      </li>`
    ).join("");

    const doc = parseHtml(`<!doctype html><html><body>
      <div id="alsoBuy"><div class="mc">
        <ul class="goods-list">${items}</ul>
      </div></div>
    </body></html>`);

    const { alternatives } = parseRecommendationItems(doc);

    expect(alternatives.length).toBe(5);
  });

  it("sets deliveryEta and packageLabel to null", () => {
    const doc = parseHtml(`<!doctype html><html><body>
      <div id="alsoBuy"><div class="mc">
        <ul class="goods-list">
          <li class="gl-item">
            <div class="p-name"><a>Some Product</a></div>
            <div class="p-price"><i>15.00</i></div>
          </li>
        </ul>
      </div></div>
    </body></html>`);

    const { alternatives } = parseRecommendationItems(doc);

    expect(alternatives[0]!.deliveryEta).toBeNull();
    expect(alternatives[0]!.packageLabel).toBeNull();
  });

  it("extracts URLs from anchor href attributes", () => {
    const doc = parseHtml(`<!doctype html><html><body>
      <div id="alsoBuy"><div class="mc">
        <ul class="goods-list">
          <li class="gl-item">
            <div class="p-name"><a href="https://item.jd.com/100001.html">Linked Product</a></div>
            <div class="p-price"><i>25.00</i></div>
          </li>
          <li class="gl-item">
            <div class="p-name"><a>No Link Product</a></div>
            <div class="p-price"><i>30.00</i></div>
          </li>
        </ul>
      </div></div>
    </body></html>`);

    const { alternatives, urls } = parseRecommendationItems(doc);

    expect(alternatives.length).toBe(2);
    expect(urls["Linked Product"]).toBe("https://item.jd.com/100001.html");
    expect(urls["No Link Product"]).toBeUndefined();
  });

  it("ignores placeholder href values like # and javascript:;", () => {
    const doc = parseHtml(`<!doctype html><html><body>
      <div id="alsoBuy"><div class="mc">
        <ul class="goods-list">
          <li class="gl-item">
            <div class="p-name"><a href="#">Hash Link</a></div>
            <div class="p-price"><i>20.00</i></div>
          </li>
          <li class="gl-item">
            <div class="p-name"><a href="javascript:;">JS Link</a></div>
            <div class="p-price"><i>22.00</i></div>
          </li>
        </ul>
      </div></div>
    </body></html>`);

    const { urls } = parseRecommendationItems(doc);

    expect(Object.keys(urls).length).toBe(0);
  });
});
