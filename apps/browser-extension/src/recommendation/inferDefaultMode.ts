import type { DecisionMode } from "../types/preferences.js";
import type { SavingsRecord } from "../types/savingsRecord.js";
import type { ViewedProduct } from "../types/viewedProduct.js";

export type InferDefaultModeInput = {
  viewedProducts: ViewedProduct[];
  savingsRecords: SavingsRecord[];
};

export type InferDefaultModeResult = {
  mode: DecisionMode;
  reason: string;
};

// Thresholds are intentionally conservative. An incorrect inference the user
// can't easily undo is worse than a generic default.
export const MIN_VIEWS_FOR_INFERENCE = 5;
export const SELF_OPERATED_RATIO_THRESHOLD = 0.7;
export const MIN_SAVINGS_FOR_VALUE_MODE = 3;

export function inferDefaultMode(
  input: InferDefaultModeInput,
): InferDefaultModeResult {
  const { viewedProducts, savingsRecords } = input;

  if (viewedProducts.length >= MIN_VIEWS_FOR_INFERENCE) {
    const selfOpCount = viewedProducts.filter(
      (p) => p.sellerType === "self_operated",
    ).length;
    const ratio = selfOpCount / viewedProducts.length;
    if (ratio >= SELF_OPERATED_RATIO_THRESHOLD) {
      return {
        mode: "safe",
        reason: "你最近常看京东自营，推荐「更稳妥」",
      };
    }
  }

  if (savingsRecords.length >= MIN_SAVINGS_FOR_VALUE_MODE) {
    return {
      mode: "value",
      reason: "你更关注价格变动，推荐「更划算」",
    };
  }

  return {
    mode: "time_saving",
    reason: "默认推荐「更省时间」",
  };
}
