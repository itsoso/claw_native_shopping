import { PRODUCT_SELECTORS, queryFirst } from "../config/selectors.js";
import type { CouponInfo, PromotionInfo, PromotionRule } from "../types/product.js";

const MANJIAN_REGEX = /满\s*(\d+(?:\.\d+)?)\s*减\s*(\d+(?:\.\d+)?)/g;
const COUPON_MANJIAN_REGEX = /满\s*(\d+(?:\.\d+)?)\s*减\s*(\d+(?:\.\d+)?)\s*券/g;
const PLAIN_COUPON_REGEX = /(\d+(?:\.\d+)?)\s*元\s*(?:券|优惠券)/g;

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
  return {
    rules: parsePromotionRules(root),
    coupons: parseCoupons(root),
  };
}

export function computeEffectivePrice(
  unitPrice: number,
  info: PromotionInfo,
): number {
  let bestDiscount = 0;

  for (const rule of info.rules) {
    if (unitPrice >= rule.threshold && rule.discount > bestDiscount) {
      bestDiscount = rule.discount;
    }
  }

  for (const coupon of info.coupons) {
    if (
      (coupon.threshold === 0 || unitPrice >= coupon.threshold) &&
      coupon.value > bestDiscount
    ) {
      bestDiscount = coupon.value;
    }
  }

  return Math.max(0, unitPrice - bestDiscount);
}
