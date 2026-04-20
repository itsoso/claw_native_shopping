import { PRODUCT_SELECTORS, parseNumber, textOf } from "../config/selectors.js";
import type { ProductPageModel } from "../types/product.js";
import { parseJdProductDocument } from "./productPage.js";
import { waitForElement } from "./waitForElement.js";

export type AsyncParseResult = {
  model: ProductPageModel;
  incomplete: boolean;
};

export type AsyncParseOptions = {
  timeout?: number | undefined;
};

export async function parseJdProductAsync(
  document: Document,
  options?: AsyncParseOptions,
): Promise<AsyncParseResult> {
  const timeout = options?.timeout ?? 5000;
  const model = parseJdProductDocument(document);

  let incomplete = false;

  if (model.unitPrice === 0) {
    const priceEl = await waitForElement(
      document,
      PRODUCT_SELECTORS.price.join(", "),
      { timeout },
    );
    if (priceEl) {
      model.unitPrice = parseNumber(priceEl.textContent?.trim() ?? null);
    } else {
      incomplete = true;
    }
  }

  if (!model.deliveryEta) {
    const deliveryEl = await waitForElement(
      document,
      PRODUCT_SELECTORS.delivery.join(", "),
      { timeout },
    );
    if (deliveryEl) {
      model.deliveryEta =
        textOf(deliveryEl.parentElement ?? document, PRODUCT_SELECTORS.delivery)
          ?.replace(/^预计\s*/, "") ?? null;
    }
  }

  return { model, incomplete };
}
