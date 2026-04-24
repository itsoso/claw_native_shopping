import type { PriceHistoryInfo, ProductPageModel } from "../types/product.js";
import type { DecisionPreferences } from "../types/preferences.js";
import type {
  AlternativeComparison,
  DecisionExplanation,
  DecisionFactor,
  ProductDecisionInput,
  ProductDecisionOutput,
} from "../types/recommendation.js";

function deliveryRank(deliveryEta: string | null): number {
  if (!deliveryEta) {
    return 0;
  }

  const normalized = deliveryEta.replace(/\s+/g, "");

  if (/今|今日|当天|当日/.test(normalized)) {
    return 3;
  }

  if (/明天/.test(normalized)) {
    return 2;
  }

  if (/后天/.test(normalized)) {
    return 1;
  }

  return 0;
}

function sellerScore(product: ProductPageModel): number {
  return product.sellerType === "self_operated" ? 2 : 0;
}

function scoreByMode(product: ProductPageModel, mode: DecisionPreferences["mode"]): number {
  if (mode === "value") {
    const price = product.effectivePrice ?? product.unitPrice;
    return -price;
  }

  const deliveryScore = deliveryRank(product.deliveryEta);
  const sellerBonus = sellerScore(product);

  if (mode === "safe") {
    return sellerBonus * 2 + deliveryScore * 2 - product.unitPrice * 0.01;
  }

  return sellerBonus * 3 + deliveryScore * 4 - product.unitPrice * 0.005;
}

function describeSeller(product: ProductPageModel): string {
  return product.sellerType === "self_operated" ? "自营" : "商家";
}

function describeTrend(priceHistory: PriceHistoryInfo | undefined): string {
  if (!priceHistory) return "";
  if (priceHistory.trend === "low") return "，近期低价";
  if (priceHistory.trend === "high") return "，价格偏高";
  return "";
}

function describeReason(
  product: ProductPageModel,
  mode: DecisionPreferences["mode"],
  priceHistory?: PriceHistoryInfo | undefined,
): string {
  const seller = describeSeller(product);
  const delivery = product.deliveryEta ?? "暂无明确时效";
  const trend = describeTrend(priceHistory);

  if (mode === "value") {
    const promoNote = product.effectivePrice != null
      ? `，到手价 ${product.effectivePrice.toFixed(2)} 元`
      : "";
    return `${seller}，标价 ${product.unitPrice.toFixed(2)} 元${promoNote}${trend}，更划算`;
  }

  if (mode === "safe") {
    return `${seller}，${delivery}${trend}，更稳妥`;
  }

  return `${seller}，${delivery}${trend}，更省时间`;
}

function buildPrimaryAction(
  current: ProductPageModel,
  chosen: ProductPageModel,
): string {
  if (chosen === current) {
    return `保留当前商品：${current.title}`;
  }

  return `建议改选${describeSeller(chosen)}：${chosen.title}`;
}

function priceFactor(product: ProductPageModel): DecisionFactor {
  if (product.effectivePrice != null && product.effectivePrice < product.unitPrice) {
    return {
      kind: "price",
      label: `到手价 ¥${product.effectivePrice.toFixed(2)}`,
      detail: `标价 ¥${product.unitPrice.toFixed(2)}`,
    };
  }
  return {
    kind: "price",
    label: `标价 ¥${product.unitPrice.toFixed(2)}`,
  };
}

function sellerFactor(product: ProductPageModel): DecisionFactor {
  return {
    kind: "seller",
    label: product.sellerType === "self_operated" ? "京东自营" : "商家配送",
  };
}

function deliveryFactorOrNull(product: ProductPageModel): DecisionFactor | null {
  if (!product.deliveryEta) return null;
  return { kind: "delivery", label: product.deliveryEta };
}

function priceHistoryFactorOrNull(
  priceHistory: PriceHistoryInfo | undefined,
): DecisionFactor | null {
  if (!priceHistory) return null;
  if (priceHistory.trend === "low") {
    return {
      kind: "price_history",
      label: "近 30 天低价",
      detail: `当前 ¥${priceHistory.currentPrice.toFixed(2)}，历史最低 ¥${priceHistory.lowestPrice.toFixed(2)}`,
    };
  }
  if (priceHistory.trend === "high") {
    return {
      kind: "price_history",
      label: "近期价格偏高",
      detail: `30 天均价 ¥${priceHistory.averagePrice.toFixed(2)}`,
    };
  }
  return { kind: "price_history", label: "近期价格平稳" };
}

function promotionFactorOrNull(product: ProductPageModel): DecisionFactor | null {
  const breakdown = product.effectivePriceBreakdown;
  if (!breakdown || breakdown.length === 0) return null;
  const applied = breakdown.filter((b) => b.applied);
  if (applied.length === 0) return null;
  const totalSaved = applied.reduce((sum, b) => sum + b.amount, 0);
  const labels = applied.map((b) => b.label).join(" + ");
  return {
    kind: "promotion",
    label: `促销合计省 ¥${totalSaved.toFixed(2)}`,
    detail: labels,
  };
}

function buildFactors(
  chosen: ProductPageModel,
  isCurrentChosen: boolean,
  priceHistory: PriceHistoryInfo | undefined,
): DecisionFactor[] {
  const factors: DecisionFactor[] = [priceFactor(chosen), sellerFactor(chosen)];
  const delivery = deliveryFactorOrNull(chosen);
  if (delivery) factors.push(delivery);
  if (isCurrentChosen) {
    const history = priceHistoryFactorOrNull(priceHistory);
    if (history) factors.push(history);
  }
  const promo = promotionFactorOrNull(chosen);
  if (promo) factors.push(promo);
  return factors;
}

function buildAlternativeComparisons(
  chosen: ProductPageModel,
  candidates: ProductPageModel[],
): AlternativeComparison[] {
  return candidates
    .filter((c) => c !== chosen)
    .map((alt) => ({
      title: alt.title,
      priceDelta:
        (chosen.effectivePrice ?? chosen.unitPrice) -
        (alt.effectivePrice ?? alt.unitPrice),
      deliveryDelta:
        deliveryRank(chosen.deliveryEta) - deliveryRank(alt.deliveryEta),
      sameSellerType: chosen.sellerType === alt.sellerType,
    }));
}

export function buildProductDecision(
  input: ProductDecisionInput,
  preferences: DecisionPreferences,
): ProductDecisionOutput {
  const candidates = [input.current, ...input.alternatives];

  const chosen = candidates.reduce((best, candidate) => {
    const bestScore = scoreByMode(best, preferences.mode);
    const candidateScore = scoreByMode(candidate, preferences.mode);

    return candidateScore > bestScore ? candidate : best;
  }, input.current);

  const isCurrentChosen = chosen === input.current;
  const chosenHistory = isCurrentChosen ? input.priceHistory : undefined;

  const explanation: DecisionExplanation = {
    mode: preferences.mode,
    factors: buildFactors(chosen, isCurrentChosen, input.priceHistory),
    alternatives: buildAlternativeComparisons(chosen, candidates),
  };

  return {
    mode: preferences.mode,
    chosen,
    primaryAction: buildPrimaryAction(input.current, chosen),
    reason: describeReason(chosen, preferences.mode, chosenHistory),
    explanation,
  };
}
