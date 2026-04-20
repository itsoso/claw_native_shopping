import { PRODUCT_SELECTORS, parseNumber, textOf } from "../config/selectors.js";
import { RECOMMENDATION_SELECTORS } from "../config/selectors.js";
import type { ProductPageModel } from "../types/product.js";
import { parseJdProductDocument } from "./productPage.js";
import { parseRecommendationItems } from "./recommendationParser.js";
import { waitForElement } from "./waitForElement.js";

export type AsyncParseResult = {
  model: ProductPageModel;
  alternatives: ProductPageModel[];
  alternativeUrls: Record<string, string>;
  incomplete: boolean;
};

export type AsyncParseOptions = {
  timeout?: number | undefined;
  recommendationTimeout?: number | undefined;
};

export async function parseJdProductAsync(
  document: Document,
  options?: AsyncParseOptions,
): Promise<AsyncParseResult> {
  const timeout = options?.timeout ?? 5000;
  const recTimeout = options?.recommendationTimeout ?? 8000;
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

  const recSelector = RECOMMENDATION_SELECTORS.container.join(", ");
  await waitForElement(document, recSelector, { timeout: recTimeout });
  const { alternatives, urls: alternativeUrls } = parseRecommendationItems(document, model.title);

  return { model, alternatives, alternativeUrls, incomplete };
}
