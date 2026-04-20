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

function textContentOf(
  root: ParentNode,
  selector: string,
): string | null {
  const element = root.querySelector(selector);
  const text = element?.textContent?.replace(/\s+/g, " ").trim();
  return text ? text : null;
}

function parseCartItem(itemNode: Element): CartItem | null {
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

  return { title, unitPrice, quantity, sellerType, packageLabel };
}

const MANJIAN_REGEX = /满\s*(\d+(?:\.\d+)?)\s*减\s*(\d+(?:\.\d+)?)/;

function parseThresholdRulesFromText(ruleNode: Element): CartThresholdRule[] {
  const text = ruleNode.textContent ?? "";
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

export function parseJdCartDocument(root: ParentNode): CartPageModel {
  const itemNodes = Array.from(
    root.querySelectorAll(CART_SELECTORS.item.join(", ")),
  );
  const items = itemNodes
    .map((node) => parseCartItem(node))
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

  return { items, thresholdRules };
}

export function parseJdCartPage(html: string): CartPageModel {
  const document = new DOMParser().parseFromString(html, "text/html");
  return parseJdCartDocument(document);
}
