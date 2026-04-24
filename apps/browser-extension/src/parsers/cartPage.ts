import {
  CART_SELECTORS,
  detectSellerType,
  parseNumber,
  queryFirst,
  textOf,
} from "../config/selectors.js";
import type {
  CartItem,
  CartPageModel,
  CartThresholdRule,
} from "../types/cart.js";
import type {
  CouponInfo,
  CrossStoreManjianRule,
} from "../types/product.js";

const SHOP_WRAP_SELECTORS = [".shop-wrap", "[data-shop-wrap]"] as const;
const COUPON_SELECTORS = [".cart-coupon", ".shop-coupon", "[data-cart-coupon]"] as const;

function textContentOf(
  root: ParentNode,
  selector: string,
): string | null {
  const element = root.querySelector(selector);
  const text = element?.textContent?.replace(/\s+/g, " ").trim();
  return text ? text : null;
}

function detectShopId(wrap: Element, index: number): string {
  const attr = wrap.getAttribute("data-shop-id");
  if (attr) return attr;
  const name = textContentOf(wrap, ".shop-name");
  if (name) return name;
  return `__shop_${index}`;
}

function findShopIdForItem(itemNode: Element, shopIdByWrap: Map<Element, string>): string | undefined {
  for (const [wrap, id] of shopIdByWrap) {
    if (wrap.contains(itemNode)) return id;
  }
  return undefined;
}

function parseCartItem(
  itemNode: Element,
  shopIdByWrap: Map<Element, string>,
): CartItem | null {
  const title =
    textOf(itemNode, CART_SELECTORS.itemName) ??
    "Unknown item";

  const priceEl = queryFirst(itemNode, CART_SELECTORS.itemPrice);
  const unitPrice =
    parseNumber(itemNode.getAttribute("data-unit-price")) ||
    parseNumber(itemNode.querySelector("[data-unit-price]")?.getAttribute("data-unit-price")) ||
    parseNumber(priceEl?.textContent?.replace(/\s+/g, " ").trim());

  if (unitPrice <= 0) {
    return null;
  }

  const quantityInput = itemNode.querySelector(".quantity-form input") as HTMLInputElement | null;
  const quantityText =
    quantityInput?.value ??
    itemNode.getAttribute("data-quantity") ??
    itemNode.querySelector("[data-quantity]")?.getAttribute("data-quantity") ??
    textContentOf(itemNode, ".quantity");
  const quantity = Math.max(1, Math.trunc(parseNumber(quantityText)));

  const packageLabel =
    itemNode.getAttribute("data-package-label") ??
    textContentOf(itemNode, ".package-label") ??
    textContentOf(itemNode, "[data-package-label]");

  const shopWrap = itemNode.closest(".shop-wrap") ?? itemNode;
  const sellerType = detectSellerType(
    shopWrap,
    CART_SELECTORS.itemSelfBadge,
    [".seller-info", "[data-seller-type]"],
  );

  return {
    title,
    unitPrice,
    quantity,
    sellerType,
    packageLabel,
    shopId: findShopIdForItem(itemNode, shopIdByWrap),
  };
}

const MANJIAN_REGEX = /满\s*(\d+(?:\.\d+)?)\s*减\s*(\d+(?:\.\d+)?)/;
const CROSS_STORE_STRIP_REGEX = /跨店满\s*\d+(?:\.\d+)?\s*减\s*\d+(?:\.\d+)?/g;
const CROSS_STORE_REGEX = /跨店满\s*(\d+(?:\.\d+)?)\s*减\s*(\d+(?:\.\d+)?)/g;
const COUPON_MANJIAN_REGEX = /满\s*(\d+(?:\.\d+)?)\s*减\s*(\d+(?:\.\d+)?)\s*券/g;
const PLAIN_COUPON_REGEX = /(\d+(?:\.\d+)?)\s*元\s*(?:券|优惠券)/g;

function parseThresholdRulesFromText(ruleNode: Element): CartThresholdRule[] {
  const raw = ruleNode.textContent ?? "";
  const text = raw.replace(CROSS_STORE_STRIP_REGEX, "");
  const rules: CartThresholdRule[] = [];
  const regex = new RegExp(MANJIAN_REGEX.source, "g");
  let match = regex.exec(text);
  while (match) {
    const threshold = parseNumber(match[1]);
    const discount = parseNumber(match[2]);
    if (threshold > 0 && discount > 0) {
      rules.push({ threshold, discount });
    }
    match = regex.exec(text);
  }
  return rules;
}

function parseThresholdRule(ruleNode: Element): CartThresholdRule | null {
  const thresholdText =
    ruleNode.getAttribute("data-threshold") ??
    textContentOf(ruleNode, "[data-threshold]") ??
    textContentOf(ruleNode, ".threshold");
  const discountText =
    ruleNode.getAttribute("data-discount") ??
    textContentOf(ruleNode, "[data-discount]") ??
    textContentOf(ruleNode, ".discount");

  const threshold = parseNumber(thresholdText);
  const discount = parseNumber(discountText);

  if (threshold <= 0 || discount <= 0) {
    return null;
  }

  return { threshold, discount };
}

function getFullText(root: ParentNode): string {
  const maybeBody = (root as { body?: Element }).body;
  if (maybeBody) return maybeBody.textContent ?? "";
  const el = root as { textContent?: string | null };
  return el.textContent ?? "";
}

function parseCrossStoreRules(root: ParentNode): CrossStoreManjianRule[] {
  const text = getFullText(root);
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

function parseCouponsFromContainer(root: ParentNode): CouponInfo[] {
  const couponEls = Array.from(root.querySelectorAll(COUPON_SELECTORS.join(", ")));
  const text = couponEls
    .map((el) => el.textContent?.replace(/\s+/g, " ").trim() ?? "")
    .filter(Boolean)
    .join(" ");
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

export function parseJdCartDocument(root: ParentNode): CartPageModel {
  const shopWraps = Array.from(
    root.querySelectorAll(SHOP_WRAP_SELECTORS.join(", ")),
  );
  const shopIdByWrap = new Map<Element, string>();
  shopWraps.forEach((wrap, index) => {
    shopIdByWrap.set(wrap, detectShopId(wrap, index));
  });

  const itemNodes = Array.from(
    root.querySelectorAll(CART_SELECTORS.item.join(", ")),
  );
  const items = itemNodes
    .map((node) => parseCartItem(node, shopIdByWrap))
    .filter((item): item is CartItem => item !== null);

  const ruleNodes = Array.from(
    root.querySelectorAll(CART_SELECTORS.promotionRule.join(", ")),
  );

  const thresholdRules: CartThresholdRule[] = [];
  for (const node of ruleNodes) {
    if (node.getAttribute("data-threshold")) {
      const rule = parseThresholdRule(node);
      if (rule) {
        thresholdRules.push(rule);
      }
    } else {
      thresholdRules.push(...parseThresholdRulesFromText(node));
    }
  }

  const couponsByShop: Record<string, CouponInfo[]> = {};
  for (const wrap of shopWraps) {
    const shopId = shopIdByWrap.get(wrap);
    if (!shopId) continue;
    const coupons = parseCouponsFromContainer(wrap);
    if (coupons.length > 0) {
      couponsByShop[shopId] = coupons;
    }
  }
  if (shopWraps.length === 0) {
    const coupons = parseCouponsFromContainer(root);
    if (coupons.length > 0) {
      couponsByShop["__default__"] = coupons;
    }
  }

  const crossStoreRules = parseCrossStoreRules(root);

  const model: CartPageModel = { items, thresholdRules };
  if (Object.keys(couponsByShop).length > 0) {
    model.couponsByShop = couponsByShop;
  }
  if (crossStoreRules.length > 0) {
    model.crossStoreRules = crossStoreRules;
  }
  return model;
}

export function parseJdCartPage(html: string): CartPageModel {
  const document = new DOMParser().parseFromString(html, "text/html");
  return parseJdCartDocument(document);
}
