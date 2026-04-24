import { PRODUCT_SELECTORS, queryFirst } from "../config/selectors.js";
import type {
  CouponInfo,
  CrossStoreManjianRule,
  DiscountBreakdown,
  ManzheRule,
  PlusPrice,
  PromotionInfo,
  PromotionRule,
  SecondHalfRule,
} from "../types/product.js";

const MANJIAN_REGEX = /满\s*(\d+(?:\.\d+)?)\s*减\s*(\d+(?:\.\d+)?)/g;
const COUPON_MANJIAN_REGEX = /满\s*(\d+(?:\.\d+)?)\s*减\s*(\d+(?:\.\d+)?)\s*券/g;
const PLAIN_COUPON_REGEX = /(\d+(?:\.\d+)?)\s*元\s*(?:券|优惠券)/g;
const MANZHE_REGEX = /满\s*(\d+)\s*件\s*(\d+(?:\.\d+)?)\s*折/g;
const SECOND_HALF_REGEX = /第二件\s*(半价|(\d+(?:\.\d+)?)\s*折)/g;
const CROSS_STORE_REGEX = /跨店满\s*(\d+(?:\.\d+)?)\s*减\s*(\d+(?:\.\d+)?)/g;

function collectText(root: ParentNode, selectors: readonly string[]): string {
  const seen = new Set<Node>();
  const parts: string[] = [];
  for (const selector of selectors) {
    const elements = root.querySelectorAll(selector);
    for (const el of elements) {
      if (seen.has(el) || [...seen].some((s) => s.contains(el) || el.contains(s))) {
        continue;
      }
      seen.add(el);
      const text = el.textContent?.replace(/\s+/g, " ").trim();
      if (text) parts.push(text);
    }
  }
  return parts.join(" ");
}

export function parsePromotionRules(root: ParentNode): PromotionRule[] {
  const text = collectText(root, PRODUCT_SELECTORS.promotion);
  if (!text) return [];

  const rules: PromotionRule[] = [];
  const seen = new Set<string>();
  const regex = new RegExp(MANJIAN_REGEX.source, "g");
  let match = regex.exec(text);
  while (match) {
    const threshold = Number.parseFloat(match[1]!);
    const discount = Number.parseFloat(match[2]!);
    const key = `${threshold}-${discount}`;
    if (threshold > 0 && discount > 0 && !seen.has(key)) {
      seen.add(key);
      rules.push({
        type: "manjian",
        threshold,
        discount,
        label: `满${match[1]}减${match[2]}`,
      });
    }
    match = regex.exec(text);
  }
  return rules;
}

export function parseCoupons(root: ParentNode): CouponInfo[] {
  const text = collectText(root, PRODUCT_SELECTORS.coupon);
  if (!text) return [];

  const coupons: CouponInfo[] = [];
  const matchedRanges: [number, number][] = [];

  const manjianRegex = new RegExp(COUPON_MANJIAN_REGEX.source, "g");
  let match = manjianRegex.exec(text);
  while (match) {
    const threshold = Number.parseFloat(match[1]!);
    const value = Number.parseFloat(match[2]!);
    if (value > 0) {
      coupons.push({ value, threshold, label: `满${match[1]}减${match[2]}券` });
      matchedRanges.push([match.index, match.index + match[0].length]);
    }
    match = manjianRegex.exec(text);
  }

  const plainRegex = new RegExp(PLAIN_COUPON_REGEX.source, "g");
  match = plainRegex.exec(text);
  while (match) {
    const overlaps = matchedRanges.some(
      ([start, end]) => match!.index >= start && match!.index < end,
    );
    if (!overlaps) {
      const value = Number.parseFloat(match[1]!);
      if (value > 0) {
        coupons.push({ value, threshold: 0, label: `${match[1]}元券` });
      }
    }
    match = plainRegex.exec(text);
  }

  return coupons;
}

export function parsePromotions(root: ParentNode): PromotionInfo {
  const info: PromotionInfo = {
    rules: parsePromotionRules(root),
    coupons: parseCoupons(root),
  };

  const manzheRules = parseManzheRules(root);
  if (manzheRules.length > 0) info.manzheRules = manzheRules;

  const secondHalfRules = parseSecondHalfRules(root);
  if (secondHalfRules.length > 0) info.secondHalfRules = secondHalfRules;

  const crossStoreRules = parseCrossStoreRules(root);
  if (crossStoreRules.length > 0) info.crossStoreRules = crossStoreRules;

  const plusPrice = parsePlusPrice(root);
  if (plusPrice) info.plusPrice = plusPrice;

  return info;
}

export function parseManzheRules(root: ParentNode): ManzheRule[] {
  const text = collectText(root, PRODUCT_SELECTORS.promotion);
  if (!text) return [];

  const rules: ManzheRule[] = [];
  const seen = new Set<string>();
  const regex = new RegExp(MANZHE_REGEX.source, "g");
  let match = regex.exec(text);
  while (match) {
    const thresholdQuantity = Number.parseInt(match[1]!, 10);
    const tenths = Number.parseFloat(match[2]!);
    const discountRate = tenths / 10;
    const key = `${thresholdQuantity}-${tenths}`;
    if (
      thresholdQuantity > 0 &&
      discountRate > 0 &&
      discountRate < 1 &&
      !seen.has(key)
    ) {
      seen.add(key);
      rules.push({
        type: "manzhe",
        thresholdQuantity,
        discountRate,
        label: `满${match[1]}件${match[2]}折`,
        stackableWithCoupon: false,
      });
    }
    match = regex.exec(text);
  }
  return rules;
}

export function parseSecondHalfRules(root: ParentNode): SecondHalfRule[] {
  const text = collectText(root, PRODUCT_SELECTORS.promotion);
  if (!text) return [];

  const rules: SecondHalfRule[] = [];
  const seen = new Set<string>();
  const regex = new RegExp(SECOND_HALF_REGEX.source, "g");
  let match = regex.exec(text);
  while (match) {
    let discountRate = 0.5;
    let label = "第二件半价";
    if (match[2]) {
      const tenths = Number.parseFloat(match[2]);
      discountRate = tenths / 10;
      label = `第二件${match[2]}折`;
    }
    if (discountRate > 0 && discountRate < 1 && !seen.has(label)) {
      seen.add(label);
      rules.push({
        type: "second_half",
        discountRate,
        label,
        stackableWithCoupon: false,
      });
    }
    match = regex.exec(text);
  }
  return rules;
}

export function parseCrossStoreRules(root: ParentNode): CrossStoreManjianRule[] {
  const text = collectText(root, PRODUCT_SELECTORS.promotion);
  if (!text) return [];

  const rules: CrossStoreManjianRule[] = [];
  const seen = new Set<string>();
  const regex = new RegExp(CROSS_STORE_REGEX.source, "g");
  let match = regex.exec(text);
  while (match) {
    const threshold = Number.parseFloat(match[1]!);
    const discount = Number.parseFloat(match[2]!);
    const key = `${threshold}-${discount}`;
    if (threshold > 0 && discount > 0 && !seen.has(key)) {
      seen.add(key);
      rules.push({
        type: "cross_store_manjian",
        threshold,
        discount,
        label: `跨店满${match[1]}减${match[2]}`,
        stackableWithCoupon: true,
      });
    }
    match = regex.exec(text);
  }
  return rules;
}

export function parsePlusPrice(root: ParentNode): PlusPrice | undefined {
  const el = queryFirst(root, PRODUCT_SELECTORS.plusPrice);
  if (!el) return undefined;
  const stripped = (el.textContent ?? "").replace(/[￥¥,\s]/g, "");
  const value = Number.parseFloat(stripped);
  if (!Number.isFinite(value) || value <= 0) return undefined;
  return { value, label: `PLUS会员价 ¥${value}` };
}

export type ComputeEffectivePriceOptions = {
  isPlus?: boolean | undefined;
};

export type ComputeEffectivePriceResult = {
  price: number;
  breakdown: DiscountBreakdown[];
};

function selectBestManjian(
  basis: number,
  rules: PromotionRule[],
): PromotionRule | null {
  let best: PromotionRule | null = null;
  for (const rule of rules) {
    if (basis >= rule.threshold && (!best || rule.discount > best.discount)) {
      best = rule;
    }
  }
  return best;
}

function selectBestCoupon(
  basis: number,
  coupons: CouponInfo[],
): CouponInfo | null {
  let best: CouponInfo | null = null;
  for (const coupon of coupons) {
    const qualifies = coupon.threshold === 0 || basis >= coupon.threshold;
    if (qualifies && (!best || coupon.value > best.value)) {
      best = coupon;
    }
  }
  return best;
}

export function computeEffectivePriceWithBreakdown(
  unitPrice: number,
  info: PromotionInfo,
  opts?: ComputeEffectivePriceOptions,
): ComputeEffectivePriceResult {
  const breakdown: DiscountBreakdown[] = [];
  let workingPrice = unitPrice;

  if (opts?.isPlus && info.plusPrice && info.plusPrice.value < workingPrice) {
    const saved = workingPrice - info.plusPrice.value;
    breakdown.push({
      type: "plus",
      label: info.plusPrice.label,
      amount: saved,
      applied: true,
    });
    workingPrice = info.plusPrice.value;
  }

  // Thresholds for manjian and coupons use the sticker basis (after PLUS).
  // Discounts then subtract sequentially. Coupons default to stackable unless
  // explicitly set false.
  const basis = workingPrice;

  const bestManjian = selectBestManjian(basis, info.rules);
  if (bestManjian) {
    breakdown.push({
      type: "manjian",
      label: bestManjian.label,
      amount: bestManjian.discount,
      applied: true,
    });
    workingPrice -= bestManjian.discount;
  }

  const bestCoupon = selectBestCoupon(basis, info.coupons);
  if (bestCoupon) {
    const stackable = bestCoupon.stackable ?? true;
    if (!bestManjian || stackable) {
      breakdown.push({
        type: "coupon",
        label: bestCoupon.label,
        amount: bestCoupon.value,
        applied: true,
      });
      workingPrice -= bestCoupon.value;
    }
  }

  for (const rule of info.manzheRules ?? []) {
    const saved = unitPrice * (1 - rule.discountRate);
    if (saved > 0) {
      breakdown.push({
        type: "manzhe_potential",
        label: rule.label,
        amount: saved,
        applied: false,
      });
    }
  }

  for (const rule of info.secondHalfRules ?? []) {
    const saved = (unitPrice * (1 - rule.discountRate)) / 2;
    if (saved > 0) {
      breakdown.push({
        type: "second_half_potential",
        label: rule.label,
        amount: saved,
        applied: false,
      });
    }
  }

  return {
    price: Math.max(0, workingPrice),
    breakdown,
  };
}

/**
 * @deprecated Prefer `computeEffectivePriceWithBreakdown` which returns the
 * full discount breakdown. This wrapper is kept for callers that only need the
 * final price.
 *
 * Note: the returned price now reflects stacked discounts (manjian + coupon)
 * instead of the previous best-single-discount behavior.
 */
export function computeEffectivePrice(
  unitPrice: number,
  info: PromotionInfo,
  opts?: ComputeEffectivePriceOptions,
): number {
  return computeEffectivePriceWithBreakdown(unitPrice, info, opts).price;
}
