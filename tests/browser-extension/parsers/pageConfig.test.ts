import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { DOMParser } from "linkedom";

import { extractPageConfig } from "../../../apps/browser-extension/src/parsers/pageConfig.js";

globalThis.DOMParser = DOMParser as unknown as typeof globalThis.DOMParser;

describe("extractPageConfig", () => {
  it("extracts product config from a real JD page fixture", () => {
    const html = readFileSync(
      "tests/browser-extension/fixtures/jd/product-page-real.html",
      "utf8",
    );
    const doc = new DOMParser().parseFromString(html, "text/html");

    const config = extractPageConfig(doc);

    expect(config).not.toBeNull();
    expect(config!.skuId).toBe("100084751");
    expect(config!.pType).toBe(1);
    expect(config!.venderId).toBe("1000004123");
    expect(config!.shopId).toBe("10038");
    expect(config!.cat).toBe("1672,2085,15901");
    expect(config!.brand).toBe("9733");
  });

  it("returns null when no pageConfig script exists", () => {
    const html = "<html><body><p>no config here</p></body></html>";
    const doc = new DOMParser().parseFromString(html, "text/html");

    expect(extractPageConfig(doc)).toBeNull();
  });

  it("returns null on malformed pageConfig content", () => {
    const html =
      '<html><body><script>var pageConfig = {{{broken</script></body></html>';
    const doc = new DOMParser().parseFromString(html, "text/html");

    expect(extractPageConfig(doc)).toBeNull();
  });
});
