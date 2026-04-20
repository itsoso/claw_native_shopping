import type { SellerType } from "../types/product.js";

export const PRODUCT_SELECTORS = {
  title: [".sku-name", "#product-name"],
  price: [".p-price span", ".price", "[data-price]"],
  selfBadge: [".u-jd", ".icon-self-run"],
  sellerInfo: [".seller-info"],
  delivery: [".summary-delivery", ".delivery"],
  packageInfo: [".Ptable", ".package-info"],
} as const;

export const RECOMMENDATION_SELECTORS = {
  container: [
    "#alsoBuy .mc",
    "#similar .mc",
    ".shop-recommend",
    ".p-store-related",
    "[data-recommend]",
  ],
  item: [".gl-item", ".goods-list li", ".mc li", ".items li"],
  itemName: [".p-name a", ".p-name em", "a[title]"],
  itemPrice: [".p-price i", ".p-price", ".price"],
  itemSelfBadge: [".u-jd", ".icon-self-run", ".goods-icon-self"],
} as const;

export const CART_SELECTORS = {
  item: [".item-form", ".item-item", ".GoodsItem", "[data-cart-item]"],
  itemName: [".p-name a", ".p-name", ".item-title", "[data-item-title]", "h2", "h3"],
  itemPrice: [".p-price strong", ".p-price", ".item-price", "[data-price]"],
  itemQuantity: [".quantity-form input", ".quantity"],
  itemSelfBadge: [".u-jd", ".icon-self-run"],
  promotionRule: [".prom-main", "[data-threshold-rule]"],
} as const;

export function queryFirst(
  root: ParentNode,
  selectors: readonly string[],
): Element | null {
  for (const selector of selectors) {
    const el = root.querySelector(selector);
    if (el) {
      return el;
    }
  }
  return null;
}

export function textOf(
  root: ParentNode,
  selectors: readonly string[],
): string | null {
  const el = queryFirst(root, selectors);
  const text = el?.textContent?.replace(/\s+/g, " ").trim();
  return text || null;
}

export function parseNumber(value: string | null | undefined): number {
  if (!value) {
    return 0;
  }
  const normalized = value.replace(/[￥,\s]/g, "");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function detectSellerType(
  root: ParentNode,
  selfBadgeSelectors: readonly string[],
  infoSelectors: readonly string[],
): SellerType {
  if (queryFirst(root, selfBadgeSelectors)) {
    return "self_operated";
  }

  const info = queryFirst(root, infoSelectors);
  if (info) {
    const attr = info.getAttribute("data-seller-type");
    if (attr === "self_operated") {
      return "self_operated";
    }
    if (/京东自营/i.test(info.textContent ?? "")) {
      return "self_operated";
    }
  }

  return "marketplace";
}
