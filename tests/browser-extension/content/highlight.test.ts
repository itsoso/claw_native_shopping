// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { highlightAndScroll } from "../../../apps/browser-extension/src/content/highlight.js";

describe("highlightAndScroll", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = `
      <div class="p-price"><span>29.90</span></div>
      <div class="summary-delivery">明天送达</div>
    `;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("adds outline to matched elements", () => {
    highlightAndScroll([
      { selector: ".p-price" },
      { selector: ".summary-delivery" },
    ]);

    const price = document.querySelector(".p-price") as HTMLElement;
    expect(price.style.cssText).toContain("outline");
    expect(price.style.cssText).toContain("#f4a261");

    const delivery = document.querySelector(".summary-delivery") as HTMLElement;
    expect(delivery.style.cssText).toContain("outline");
  });

  it("cleanup function removes outlines", () => {
    const cleanup = highlightAndScroll([{ selector: ".p-price" }]);
    const price = document.querySelector(".p-price") as HTMLElement;

    expect(price.style.cssText).toContain("outline");

    cleanup();

    expect(price.style.cssText).not.toContain("outline");
  });

  it("auto-cleans up after timeout", () => {
    highlightAndScroll([{ selector: ".p-price" }]);
    const price = document.querySelector(".p-price") as HTMLElement;

    expect(price.style.cssText).toContain("outline");

    vi.advanceTimersByTime(8000);

    expect(price.style.cssText).not.toContain("outline");
  });

  it("handles missing elements gracefully", () => {
    expect(() => {
      highlightAndScroll([
        { selector: ".nonexistent" },
        { selector: ".also-missing" },
      ]);
    }).not.toThrow();
  });
});
