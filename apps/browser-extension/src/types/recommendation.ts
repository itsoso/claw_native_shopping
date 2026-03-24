import type { ProductPageModel } from "./product.js";
import type { DecisionMode } from "./preferences.js";

export type ProductDecisionInput = {
  current: ProductPageModel;
  alternatives: ProductPageModel[];
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
