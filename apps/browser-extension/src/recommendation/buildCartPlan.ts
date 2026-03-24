import type {
  CartItem,
  CartPageModel,
  CartPlanOutput,
  CartThresholdRule,
} from "../types/cart.js";

function formatMoney(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function getCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
}

function chooseRule(
  total: number,
  thresholdRules: CartThresholdRule[],
): CartThresholdRule | null {
  if (thresholdRules.length === 0) {
    return null;
  }

  const satisfiedRules = thresholdRules.filter((rule) => total >= rule.threshold);
  if (satisfiedRules.length > 0) {
    return satisfiedRules.reduce((best, rule) => {
      if (rule.discount > best.discount) {
        return rule;
      }

      if (rule.discount === best.discount && rule.threshold < best.threshold) {
        return rule;
      }

      return best;
    });
  }

  return thresholdRules.reduce((best, rule) => {
    const bestGap = best.threshold - total;
    const currentGap = rule.threshold - total;

    if (currentGap < bestGap) {
      return rule;
    }

    if (currentGap === bestGap && rule.discount > best.discount) {
      return rule;
    }

    return best;
  });
}

function chooseCheapestItem(items: CartItem[]): CartItem | null {
  if (items.length === 0) {
    return null;
  }

  return items.reduce((best, item) => {
    if (item.unitPrice < best.unitPrice) {
      return item;
    }

    if (item.unitPrice === best.unitPrice && item.quantity < best.quantity) {
      return item;
    }

    return best;
  });
}

export function buildCartPlan(input: CartPageModel): CartPlanOutput {
  const total = getCartTotal(input.items);
  const selectedRule = chooseRule(total, input.thresholdRules);

  if (!selectedRule) {
    return {
      summary: "当前购物车没有可用满减规则，直接结算。",
      actions: ["直接结算"],
    };
  }

  if (total >= selectedRule.threshold) {
    return {
      summary: `已满足满 ${formatMoney(selectedRule.threshold)} 减 ${formatMoney(selectedRule.discount)}，可以直接结算。`,
      actions: ["保持当前购物车并结算"],
    };
  }

  const gap = selectedRule.threshold - total;
  const cheapestItem = chooseCheapestItem(input.items);

  if (!cheapestItem) {
    return {
      summary: `再补 ${gap.toFixed(2)} 元可满 ${formatMoney(selectedRule.threshold)} 减 ${formatMoney(selectedRule.discount)}。`,
      actions: ["先加入 1 件商品凑单"],
    };
  }

  const neededUnits = Math.max(1, Math.ceil(gap / cheapestItem.unitPrice));

  return {
    summary: `再补 ${gap.toFixed(2)} 元可满 ${formatMoney(selectedRule.threshold)} 减 ${formatMoney(selectedRule.discount)}。`,
    actions: [
      `加购 ${neededUnits} 件「${cheapestItem.title}」凑单`,
      "保留当前购物车",
    ],
  };
}
