import { RECOMMENDATION_SELECTORS, parseNumber, queryFirst, textOf } from "../config/selectors.js";
import type { ProductPageModel, SellerType } from "../types/product.js";

const MAX_ALTERNATIVES = 5;

export type RecommendationParseResult = {
  alternatives: ProductPageModel[];
  urls: Record<string, string>;
};

function findContainers(root: ParentNode): Element[] {
  const containers: Element[] = [];
  for (const selector of RECOMMENDATION_SELECTORS.container) {
    const els = root.querySelectorAll(selector);
    for (const el of els) {
      containers.push(el);
    }
  }
  return containers;
}

function findItems(container: Element): Element[] {
  for (const selector of RECOMMENDATION_SELECTORS.item) {
    const els = container.querySelectorAll(selector);
    if (els.length > 0) {
      return Array.from(els);
    }
  }
  return [];
}

function extractUrl(item: Element): string | null {
  const link = queryFirst(item, [...RECOMMENDATION_SELECTORS.itemName]);
  if (link && link.tagName === "A") {
    const href = link.getAttribute("href");
    if (href && href !== "#" && href !== "javascript:;") {
      return href;
    }
  }
  const anyLink = item.querySelector("a[href]");
  if (anyLink) {
    const href = anyLink.getAttribute("href");
    if (href && href !== "#" && href !== "javascript:;") {
      return href;
    }
  }
  return null;
}

function parseItem(item: Element): ProductPageModel | null {
  const title = textOf(item, [...RECOMMENDATION_SELECTORS.itemName]);
  if (!title) {
    return null;
  }

  const priceText = textOf(item, [...RECOMMENDATION_SELECTORS.itemPrice]);
  const unitPrice = parseNumber(priceText);
  if (unitPrice <= 0) {
    return null;
  }

  const selfBadge = queryFirst(item, [...RECOMMENDATION_SELECTORS.itemSelfBadge]);
  const sellerType: SellerType = selfBadge ? "self_operated" : "marketplace";

  return {
    title,
    unitPrice,
    sellerType,
    deliveryEta: null,
    packageLabel: null,
  };
}

export function parseRecommendationItems(
  root: ParentNode,
  currentTitle?: string | undefined,
): RecommendationParseResult {
  const containers = findContainers(root);
  const seen = new Set<string>();
  const alternatives: ProductPageModel[] = [];
  const urls: Record<string, string> = {};

  const normalizedCurrent = currentTitle?.toLowerCase().replace(/\s+/g, "");

  for (const container of containers) {
    const items = findItems(container);
    for (const item of items) {
      if (alternatives.length >= MAX_ALTERNATIVES) {
        return { alternatives, urls };
      }

      const product = parseItem(item);
      if (!product) {
        continue;
      }

      const key = product.title.toLowerCase().replace(/\s+/g, "");
      if (seen.has(key)) {
        continue;
      }
      if (normalizedCurrent && key === normalizedCurrent) {
        continue;
      }

      seen.add(key);
      alternatives.push(product);

      const url = extractUrl(item);
      if (url) {
        urls[product.title] = url;
      }
    }
  }

  return { alternatives, urls };
}
