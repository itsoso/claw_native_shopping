// @vitest-environment jsdom

import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { parseJdProductAsync } from "../../../apps/browser-extension/src/parsers/asyncProductParser.js";

describe("parseJdProductAsync", () => {
  it("returns complete model when price is already in DOM", async () => {
    document.body.innerHTML = readFileSync(
      "tests/browser-extension/fixtures/jd/product-page.html",
      "utf8",
    );

    const { model, incomplete } = await parseJdProductAsync(document, {
      timeout: 500,
    });

    expect(incomplete).toBe(false);
    expect(model.title).toContain("洗衣液");
    expect(model.unitPrice).toBe(29.9);
    expect(model.sellerType).toBe("self_operated");
  });

  it("waits for async price and resolves", async () => {
    document.body.innerHTML = `
      <script>var pageConfig = { product: { skuId: '1', pType: 1 } };</script>
      <div class="sku-name">Async Product</div>
      <div class="summary-delivery"><span>预计</span><strong>明天</strong><span>送达</span></div>
    `;

    const promise = parseJdProductAsync(document, { timeout: 2000 });

    setTimeout(() => {
      const priceDiv = document.createElement("div");
      priceDiv.className = "p-price";
      priceDiv.innerHTML = "<span>88.00</span>";
      document.body.appendChild(priceDiv);
    }, 50);

    const { model, incomplete } = await promise;

    expect(incomplete).toBe(false);
    expect(model.unitPrice).toBe(88);
    expect(model.title).toBe("Async Product");
  });

  it("marks incomplete when price never appears", async () => {
    document.body.innerHTML = `
      <script>var pageConfig = { product: { skuId: '2', pType: 2 } };</script>
      <div class="sku-name">No Price Product</div>
    `;

    const { model, incomplete } = await parseJdProductAsync(document, {
      timeout: 100,
    });

    expect(incomplete).toBe(true);
    expect(model.unitPrice).toBe(0);
    expect(model.title).toBe("No Price Product");
  });
});
