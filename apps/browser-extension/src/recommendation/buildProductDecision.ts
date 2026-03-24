import type { ProductPageModel } from "../types/product.js";
import type { DecisionPreferences } from "../types/preferences.js";
import type {
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
    return -product.unitPrice;
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

function describeReason(product: ProductPageModel, mode: DecisionPreferences["mode"]): string {
  const seller = describeSeller(product);
  const delivery = product.deliveryEta ?? "暂无明确时效";

  if (mode === "value") {
    return `${seller}，单价 ${product.unitPrice.toFixed(2)} 元，更划算`;
  }

  if (mode === "safe") {
    return `${seller}，${delivery}，更稳妥`;
  }

  return `${seller}，${delivery}，更省时间`;
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

  return {
    mode: preferences.mode,
    chosen,
    primaryAction: buildPrimaryAction(input.current, chosen),
    reason: describeReason(chosen, preferences.mode),
  };
}
