import { describe, expect, it } from "vitest";
import { DOMParser } from "linkedom";

import {
  computeEffectivePrice,
  parseCoupons,
  parsePromotionRules,
  parsePromotions,
} from "../../../apps/browser-extension/src/parsers/promotionParser.js";

function makeDoc(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc as unknown as ParentNode;
}

describe("parsePromotionRules", () => {
  it("extracts manjian rules from promotion elements", () => {
    const doc = makeDoc(`
      <div class="summary-promotion">
        <span>满199减100</span>
        <span>满99减30</span>
      </div>
    `);

    const rules = parsePromotionRules(doc);
    expect(rules).toEqual([
      { type: "manjian", threshold: 199, discount: 100, label: "满199减100" },
      { type: "manjian", threshold: 99, discount: 30, label: "满99减30" },
    ]);
  });

  it("handles comma-separated rules in single element", () => {
    const doc = makeDoc(`
      <div class="p-prom">满99减20，满199减50</div>
    `);

    const rules = parsePromotionRules(doc);
    expect(rules.length).toBe(2);
    expect(rules[0]!.threshold).toBe(99);
    expect(rules[1]!.threshold).toBe(199);
  });

  it("deduplicates identical rules", () => {
    const doc = makeDoc(`
      <div class="summary-promotion"><span>满99减20</span></div>
      <div class="p-prom"><span>满99减20</span></div>
    `);

    const rules = parsePromotionRules(doc);
    expect(rules.length).toBe(1);
  });

  it("uses data-promotion attribute selector", () => {
    const doc = makeDoc(`
      <div data-promotion="true">满59减10</div>
    `);

    const rules = parsePromotionRules(doc);
    expect(rules.length).toBe(1);
    expect(rules[0]!.discount).toBe(10);
  });

  it("returns empty array when no promotion elements", () => {
    const doc = makeDoc(`<div class="other">hello</div>`);
    expect(parsePromotionRules(doc)).toEqual([]);
  });

  it("handles decimal thresholds and discounts", () => {
    const doc = makeDoc(`
      <div class="summary-promotion">满99.9减10.5</div>
    `);

    const rules = parsePromotionRules(doc);
    expect(rules[0]!.threshold).toBe(99.9);
    expect(rules[0]!.discount).toBe(10.5);
  });
});

describe("parseCoupons", () => {
  it("extracts manjian coupons", () => {
    const doc = makeDoc(`
      <div class="summary-quan">
        <span class="quan-item">满99减10券</span>
      </div>
    `);

    const coupons = parseCoupons(doc);
    expect(coupons).toEqual([
      { value: 10, threshold: 99, label: "满99减10券" },
    ]);
  });

  it("extracts plain value coupons", () => {
    const doc = makeDoc(`
      <div class="summary-quan">
        <span>5元券</span>
      </div>
    `);

    const coupons = parseCoupons(doc);
    expect(coupons).toEqual([
      { value: 5, threshold: 0, label: "5元券" },
    ]);
  });

  it("extracts coupons using data-coupon selector", () => {
    const doc = makeDoc(`
      <div data-coupon="true">满199减30券</div>
    `);

    const coupons = parseCoupons(doc);
    expect(coupons.length).toBe(1);
    expect(coupons[0]!.value).toBe(30);
  });

  it("returns empty array when no coupon elements", () => {
    const doc = makeDoc(`<div>no coupons</div>`);
    expect(parseCoupons(doc)).toEqual([]);
  });
});

describe("parsePromotions", () => {
  it("combines rules and coupons", () => {
    const doc = makeDoc(`
      <div class="summary-promotion">满199减100</div>
      <div class="summary-quan"><span>10元优惠券</span></div>
    `);

    const info = parsePromotions(doc);
    expect(info.rules.length).toBe(1);
    expect(info.coupons.length).toBe(1);
  });
});

describe("computeEffectivePrice", () => {
  it("applies the best applicable manjian rule", () => {
    const info = {
      rules: [
        { type: "manjian" as const, threshold: 99, discount: 20, label: "满99减20" },
        { type: "manjian" as const, threshold: 199, discount: 50, label: "满199减50" },
      ],
      coupons: [],
    };

    expect(computeEffectivePrice(250, info)).toBe(200);
    expect(computeEffectivePrice(150, info)).toBe(130);
    expect(computeEffectivePrice(50, info)).toBe(50);
  });

  it("applies coupon when better than manjian", () => {
    const info = {
      rules: [
        { type: "manjian" as const, threshold: 99, discount: 10, label: "满99减10" },
      ],
      coupons: [
        { value: 25, threshold: 99, label: "满99减25券" },
      ],
    };

    expect(computeEffectivePrice(100, info)).toBe(75);
  });

  it("applies no-threshold coupon", () => {
    const info = {
      rules: [],
      coupons: [{ value: 5, threshold: 0, label: "5元券" }],
    };

    expect(computeEffectivePrice(30, info)).toBe(25);
  });

  it("returns unitPrice when no applicable promotions", () => {
    const info = {
      rules: [
        { type: "manjian" as const, threshold: 199, discount: 50, label: "满199减50" },
      ],
      coupons: [],
    };

    expect(computeEffectivePrice(100, info)).toBe(100);
  });

  it("never returns below zero", () => {
    const info = {
      rules: [],
      coupons: [{ value: 100, threshold: 0, label: "100元券" }],
    };

    expect(computeEffectivePrice(50, info)).toBe(0);
  });
});
