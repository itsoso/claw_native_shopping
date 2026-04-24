import type { PriceHistoryInfo, ProductPageModel } from "./product.js";
import type { DecisionMode } from "./preferences.js";

export type ProductDecisionInput = {
  current: ProductPageModel;
  alternatives: ProductPageModel[];
  priceHistory?: PriceHistoryInfo | undefined;
};

export type DecisionFactorKind =
  | "price"
  | "delivery"
  | "seller"
  | "price_history"
  | "promotion";

export type DecisionFactor = {
  kind: DecisionFactorKind;
  label: string;
  detail?: string | undefined;
};

export type AlternativeComparison = {
  title: string;
  priceDelta: number;
  deliveryDelta: number;
  sameSellerType: boolean;
};

export type DecisionExplanation = {
  mode: DecisionMode;
  factors: DecisionFactor[];
  alternatives: AlternativeComparison[];
};

export type ProductDecisionOutput = {
  mode: DecisionMode;
  chosen: ProductPageModel;
  primaryAction: string;
  reason: string;
  explanation: DecisionExplanation;
};

export type ProductDecisionProps = {
  primaryAction: string;
  reason: string;
};
