import type {
  CartItem,
  CartPageModel,
  CartThresholdRule,
} from "../types/cart.js";
import type { SellerType } from "../types/product.js";

function textContentOf(
  root: ParentNode,
  selector: string,
): string | null {
  const element = root.querySelector(selector);
  const text = element?.textContent?.replace(/\s+/g, " ").trim();
  return text ? text : null;
}

function parseNumber(value: string | null | undefined): number {
  if (!value) {
    return 0;
  }

  const normalized = value.replace(/[￥,\s]/g, "");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseSellerType(root: Element): SellerType {
  const sellerType = root.getAttribute("data-seller-type");

  if (sellerType === "self_operated") {
    return "self_operated";
  }

  const seller = root.querySelector("[data-seller-type]");
  const nestedSellerType = seller?.getAttribute("data-seller-type");

  if (nestedSellerType === "self_operated") {
    return "self_operated";
  }

  const sellerText = seller?.textContent ?? "";
  if (/京东自营/i.test(sellerText)) {
    return "self_operated";
  }

  return "marketplace";
}

function parseCartItem(itemNode: Element): CartItem | null {
  const title =
    textContentOf(itemNode, ".item-title") ??
    textContentOf(itemNode, "[data-item-title]") ??
    textContentOf(itemNode, "h2") ??
    textContentOf(itemNode, "h3") ??
    "Unknown item";

  const unitPrice =
    parseNumber(itemNode.getAttribute("data-unit-price")) ||
    parseNumber(itemNode.querySelector("[data-unit-price]")?.getAttribute("data-unit-price")) ||
    parseNumber(textContentOf(itemNode, ".item-price")) ||
    parseNumber(textContentOf(itemNode, "[data-price]"));

  if (unitPrice <= 0) {
    return null;
  }

  const quantityText =
    itemNode.getAttribute("data-quantity") ??
    itemNode.querySelector("[data-quantity]")?.getAttribute("data-quantity") ??
    textContentOf(itemNode, ".quantity");
  const quantity = Math.max(1, Math.trunc(parseNumber(quantityText)));

  const packageLabel =
    itemNode.getAttribute("data-package-label") ??
    textContentOf(itemNode, ".package-label") ??
    textContentOf(itemNode, "[data-package-label]");

  return {
    title,
    unitPrice,
    quantity,
    sellerType: parseSellerType(itemNode),
    packageLabel,
  };
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
  const items = Array.from(root.querySelectorAll("[data-cart-item]"))
    .map((itemNode) => parseCartItem(itemNode))
    .filter((item): item is CartItem => item !== null);

  const thresholdRules = Array.from(root.querySelectorAll("[data-threshold-rule]"))
    .map((ruleNode) => parseThresholdRule(ruleNode))
    .filter((rule): rule is CartThresholdRule => rule !== null);

  return { items, thresholdRules };
}

export function parseJdCartPage(html: string): CartPageModel {
  const document = new DOMParser().parseFromString(html, "text/html");
  return parseJdCartDocument(document);
}
