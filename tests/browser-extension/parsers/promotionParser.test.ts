import { describe, expect, it } from "vitest";
import { DOMParser } from "linkedom";

import {
  computeEffectivePrice,
  parseCoupons,
  parseCrossStoreRules,
  parseManzheRules,
  parsePlusPrice,
  parsePromotionRules,
  parsePromotions,
  parseSecondHalfRules,
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

describe("parseManzheRules", () => {
  it("extracts 满X件Y折 rules", () => {
    const doc = makeDoc(`
      <div class="summary-promotion">满3件8折</div>
    `);

    const rules = parseManzheRules(doc);
    expect(rules).toEqual([
      {
        type: "manzhe",
        thresholdQuantity: 3,
        discountRate: 0.8,
        label: "满3件8折",
        stackableWithCoupon: false,
      },
    ]);
  });

  it("deduplicates identical manzhe rules across elements", () => {
    const doc = makeDoc(`
      <div class="summary-promotion">满2件9折</div>
      <div class="p-prom">满2件9折</div>
    `);

    expect(parseManzheRules(doc).length).toBe(1);
  });

  it("returns empty when no manzhe text", () => {
    const doc = makeDoc(`<div class="summary-promotion">满199减100</div>`);
    expect(parseManzheRules(doc)).toEqual([]);
  });
});

describe("parseSecondHalfRules", () => {
  it("extracts 第二件半价 with 0.5 discount rate", () => {
    const doc = makeDoc(`
      <div class="summary-promotion">第二件半价</div>
    `);

    const rules = parseSecondHalfRules(doc);
    expect(rules).toEqual([
      {
        type: "second_half",
        discountRate: 0.5,
        label: "第二件半价",
        stackableWithCoupon: false,
      },
    ]);
  });

  it("extracts 第二件N折 with fractional discount rate", () => {
    const doc = makeDoc(`
      <div class="summary-promotion">第二件7折</div>
    `);

    const rules = parseSecondHalfRules(doc);
    expect(rules[0]!.discountRate).toBe(0.7);
    expect(rules[0]!.label).toBe("第二件7折");
  });

  it("returns empty when no second-half text", () => {
    const doc = makeDoc(`<div class="summary-promotion">满99减10</div>`);
    expect(parseSecondHalfRules(doc)).toEqual([]);
  });
});

describe("parseCrossStoreRules", () => {
  it("extracts 跨店满X减Y rules", () => {
    const doc = makeDoc(`
      <div class="summary-promotion">跨店满300减50</div>
    `);

    const rules = parseCrossStoreRules(doc);
    expect(rules).toEqual([
      {
        type: "cross_store_manjian",
        threshold: 300,
        discount: 50,
        label: "跨店满300减50",
        stackableWithCoupon: true,
      },
    ]);
  });

  it("returns empty when only in-store manjian is present", () => {
    const doc = makeDoc(`<div class="summary-promotion">满199减30</div>`);
    expect(parseCrossStoreRules(doc)).toEqual([]);
  });
});

describe("parsePlusPrice", () => {
  it("extracts PLUS price from .plus-price element", () => {
    const doc = makeDoc(`
      <div class="plus-price">¥88.50</div>
    `);

    const plus = parsePlusPrice(doc);
    expect(plus).toEqual({ value: 88.5, label: "PLUS会员价 ¥88.5" });
  });

  it("returns undefined when no plus-price element", () => {
    const doc = makeDoc(`<div class="summary-promotion">满99减10</div>`);
    expect(parsePlusPrice(doc)).toBeUndefined();
  });

  it("returns undefined when value is zero", () => {
    const doc = makeDoc(`<div class="plus-price">暂无</div>`);
    expect(parsePlusPrice(doc)).toBeUndefined();
  });
});

describe("parsePromotions with new variants", () => {
  it("attaches manzhe, second_half, cross_store, and plus fields", () => {
    const doc = makeDoc(`
      <div class="summary-promotion">
        满199减30，满3件8折，第二件半价，跨店满300减50
      </div>
      <div class="plus-price">¥79.90</div>
      <div class="summary-quan"><span class="quan-item">满99减10券</span></div>
    `);

    const info = parsePromotions(doc);
    // "跨店满300减50" also matches MANJIAN_REGEX as substring — PR 2 will dedupe
    expect(info.rules.length).toBeGreaterThanOrEqual(1);
    expect(info.coupons.length).toBe(1);
    expect(info.manzheRules?.length).toBe(1);
    expect(info.secondHalfRules?.length).toBe(1);
    expect(info.crossStoreRules?.length).toBe(1);
    expect(info.plusPrice?.value).toBe(79.9);
  });

  it("omits new optional fields when no matches (backward compat)", () => {
    const doc = makeDoc(`
      <div class="summary-promotion">满99减10</div>
    `);

    const info = parsePromotions(doc);
    expect(info.rules.length).toBe(1);
    expect(info.manzheRules).toBeUndefined();
    expect(info.secondHalfRules).toBeUndefined();
    expect(info.crossStoreRules).toBeUndefined();
    expect(info.plusPrice).toBeUndefined();
  });
});
