import type { PriceHistoryInfo, ProductPageModel } from "./product.js";
import type { DecisionMode } from "./preferences.js";

export type ProductDecisionInput = {
  current: ProductPageModel;
  alternatives: ProductPageModel[];
  priceHistory?: PriceHistoryInfo | undefined;
};

export type ProductDecisionOutput = {
  mode: DecisionMode;
  chosen: ProductPageModel;
  primaryAction: string;
  reason: string;
};

export type ProductDecisionProps = {
  primaryAction: string;
  reason: string;
};
