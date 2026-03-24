import type { ProductPageModel, SellerType } from "../types/product.js";

function textContentOf(document: Document, selector: string): string | null {
  const element = document.querySelector(selector);
  const text = element?.textContent?.replace(/\s+/g, " ").trim();
  return text ? text : null;
}

function parseSellerType(document: Document): SellerType {
  const seller = document.querySelector(".seller-info");
  const sellerType = seller?.getAttribute("data-seller-type");

  if (sellerType === "self_operated") {
    return "self_operated";
  }

  const sellerText = seller?.textContent ?? "";
  if (/京东自营/i.test(sellerText)) {
    return "self_operated";
  }

  return "marketplace";
}

function parseUnitPrice(document: Document): number {
  const priceText =
    document.querySelector(".price")?.textContent?.replace(/\s+/g, " ").trim() ??
    document.querySelector("[data-price]")?.getAttribute("data-price")?.trim() ??
    null;

  if (!priceText) {
    return 0;
  }

  const normalized = priceText.replace(/[￥,]/g, "");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function parseJdProductPage(html: string): ProductPageModel {
  const document = new DOMParser().parseFromString(html, "text/html");

  const title =
    textContentOf(document, "#product-name") ??
    textContentOf(document, "title") ??
    "Unknown product";

  const deliveryEta =
    textContentOf(document, ".delivery")?.replace(/^预计\s*/, "") ?? null;

  const packageLabel =
    textContentOf(document, ".package-info")
      ?.replace(/^规格：\s*/, "")
      .trim() ?? null;

  return {
    title,
    unitPrice: parseUnitPrice(document),
    sellerType: parseSellerType(document),
    deliveryEta,
    packageLabel,
  };
}
