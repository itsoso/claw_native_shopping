import {
  PRODUCT_SELECTORS,
  detectSellerType,
  parseNumber,
  textOf,
} from "../config/selectors.js";
import type { ProductPageModel, SellerType } from "../types/product.js";
import { extractPageConfig } from "./pageConfig.js";

export function parseJdProductDocument(document: Document): ProductPageModel {
  const title =
    textOf(document, PRODUCT_SELECTORS.title) ??
    document.querySelector("title")?.textContent?.replace(/\s+/g, " ").trim() ??
    "Unknown product";

  const priceText =
    textOf(document, PRODUCT_SELECTORS.price);
  const unitPrice = parseNumber(priceText);

  const pageConfig = extractPageConfig(document);

  let sellerType: SellerType;
  if (pageConfig?.pType === 1) {
    sellerType = "self_operated";
  } else if (pageConfig?.pType === 2) {
    sellerType = "marketplace";
  } else {
    sellerType = detectSellerType(
      document,
      PRODUCT_SELECTORS.selfBadge,
      PRODUCT_SELECTORS.sellerInfo,
    );
  }

  const deliveryEta =
    textOf(document, PRODUCT_SELECTORS.delivery)?.replace(/^预计\s*/, "") ?? null;

  const packageLabel =
    textOf(document, PRODUCT_SELECTORS.packageInfo)
      ?.replace(/^规格[：:]\s*/, "")
      .trim() ?? null;

  return { title, unitPrice, sellerType, deliveryEta, packageLabel };
}

export function parseJdProductPage(html: string): ProductPageModel {
  const document = new DOMParser().parseFromString(html, "text/html");
  return parseJdProductDocument(document);
}
