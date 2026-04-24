import type {
  CartItem,
  CartPageModel,
  CartPlanOutput,
  CartThresholdRule,
  OptimalTopUp,
} from "../types/cart.js";
import type {
  CouponInfo,
  CrossStoreManjianRule,
  DiscountBreakdown,
} from "../types/product.js";

const MAX_TOP_UP_UNITS = 3;

function formatMoney(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function getCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
}

function pickBestManjianRule(
  subtotal: number,
  rules: CartThresholdRule[],
): CartThresholdRule | null {
  const satisfied = rules.filter((rule) => subtotal >= rule.threshold);
  if (satisfied.length === 0) return null;
  return satisfied.reduce((best, rule) =>
    rule.discount > best.discount ? rule : best,
  );
}

function pickBestCrossStoreRule(
  subtotal: number,
  rules: CrossStoreManjianRule[] | undefined,
): CrossStoreManjianRule | null {
  if (!rules || rules.length === 0) return null;
  const satisfied = rules.filter((rule) => subtotal >= rule.threshold);
  if (satisfied.length === 0) return null;
  return satisfied.reduce((best, rule) =>
    rule.discount > best.discount ? rule : best,
  );
}

function pickBestCoupon(
  subtotal: number,
  couponsByShop: Record<string, CouponInfo[]> | undefined,
): CouponInfo | null {
  if (!couponsByShop) return null;
  const flat = Object.values(couponsByShop).flat();
  const qualified = flat.filter(
    (c) => c.threshold === 0 || subtotal >= c.threshold,
  );
  if (qualified.length === 0) return null;
  return qualified.reduce((best, coupon) =>
    coupon.value > best.value ? coupon : best,
  );
}

type CartPricing = {
  subtotal: number;
  effectiveTotal: number;
  discount: number;
  breakdown: DiscountBreakdown[];
  appliedManjian: CartThresholdRule | null;
};

function computeCartPricing(input: CartPageModel): CartPricing {
  const subtotal = getCartTotal(input.items);
  const breakdown: DiscountBreakdown[] = [];
  let workingTotal = subtotal;

  const appliedManjian = pickBestManjianRule(subtotal, input.thresholdRules);
  if (appliedManjian) {
    workingTotal -= appliedManjian.discount;
    breakdown.push({
      type: "manjian",
      label: `满${formatMoney(appliedManjian.threshold)}减${formatMoney(appliedManjian.discount)}`,
      amount: appliedManjian.discount,
      applied: true,
    });
  }

  const appliedCrossStore = pickBestCrossStoreRule(subtotal, input.crossStoreRules);
  if (appliedCrossStore) {
    workingTotal -= appliedCrossStore.discount;
    breakdown.push({
      type: "manjian",
      label: appliedCrossStore.label,
      amount: appliedCrossStore.discount,
      applied: true,
    });
  }

  const appliedCoupon = pickBestCoupon(subtotal, input.couponsByShop);
  if (appliedCoupon) {
    const stackable = appliedCoupon.stackable ?? true;
    if (!appliedManjian || stackable) {
      workingTotal -= appliedCoupon.value;
      breakdown.push({
        type: "coupon",
        label: appliedCoupon.label,
        amount: appliedCoupon.value,
        applied: true,
      });
    }
  }

  const effectiveTotal = Math.max(0, workingTotal);
  const discount = subtotal - effectiveTotal;

  return {
    subtotal,
    effectiveTotal,
    discount,
    breakdown,
    appliedManjian,
  };
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

function findOptimalTopUp(
  items: CartItem[],
  gap: number,
  discount: number,
): OptimalTopUp | null {
  if (items.length === 0 || gap <= 0) {
    return null;
  }

  let best: OptimalTopUp | null = null;
  for (const item of items) {
    for (let units = 1; units <= MAX_TOP_UP_UNITS; units++) {
      const addedCost = item.unitPrice * units;
      const overflow = addedCost - gap;
      if (overflow < 0) continue;
      const candidate: OptimalTopUp = {
        item,
        units,
        addedCost,
        overflow,
        netSaved: discount - overflow,
      };
      if (!best || candidate.overflow < best.overflow) {
        best = candidate;
      }
      break;
    }
  }

  if (!best || best.netSaved <= 0) {
    return null;
  }
  return best;
}

// TODO(PR-future): findRemovalOpportunity — if subtotal already satisfies a
// rule but overshoots, check whether removing a single item still satisfies
// the rule for a better net outcome. Rare case; not wired up in this PR.

function attachPricing(
  output: CartPlanOutput,
  pricing: CartPricing,
): CartPlanOutput {
  if (pricing.discount > 0) {
    output.effectiveTotal = pricing.effectiveTotal;
    output.discount = pricing.discount;
  }
  if (pricing.breakdown.length > 0) {
    output.breakdown = pricing.breakdown;
  }
  return output;
}

export function buildCartPlan(input: CartPageModel): CartPlanOutput {
  const pricing = computeCartPricing(input);
  const total = pricing.subtotal;
  const selectedRule = chooseRule(total, input.thresholdRules);

  if (!selectedRule) {
    const summary = pricing.discount > 0
      ? `当前购物车可享优惠 ¥${pricing.discount.toFixed(2)}，直接结算。`
      : "当前购物车没有可用满减规则，直接结算。";
    return attachPricing({ summary, actions: ["直接结算"] }, pricing);
  }

  if (total >= selectedRule.threshold) {
    return attachPricing(
      {
        summary: `已满足满 ${formatMoney(selectedRule.threshold)} 减 ${formatMoney(selectedRule.discount)}，可以直接结算。`,
        actions: ["保持当前购物车并结算"],
      },
      pricing,
    );
  }

  const gap = selectedRule.threshold - total;
  const topUp = findOptimalTopUp(input.items, gap, selectedRule.discount);

  if (!topUp) {
    const cheapestAvailable = input.items.find((item) => item.unitPrice > 0);
    if (!cheapestAvailable) {
      return attachPricing(
        {
          summary: `再补 ${gap.toFixed(2)} 元可满 ${formatMoney(selectedRule.threshold)} 减 ${formatMoney(selectedRule.discount)}。`,
          actions: ["先加入 1 件商品凑单"],
        },
        pricing,
      );
    }
    // Have items but no economical top-up: warn instead of recommending.
    const unitsToClear = Math.max(1, Math.ceil(gap / cheapestAvailable.unitPrice));
    const overflow =
      cheapestAvailable.unitPrice * unitsToClear - gap;
    return attachPricing(
      {
        summary: `再补 ${gap.toFixed(2)} 元可满 ${formatMoney(selectedRule.threshold)} 减 ${formatMoney(selectedRule.discount)}。`,
        actions: [
          `凑单不划算（多花 ¥${overflow.toFixed(2)} ≥ 省 ¥${formatMoney(selectedRule.discount)}），建议直接结算`,
        ],
      },
      pricing,
    );
  }

  return attachPricing(
    {
      summary: `再补 ${gap.toFixed(2)} 元可满 ${formatMoney(selectedRule.threshold)} 减 ${formatMoney(selectedRule.discount)}。`,
      actions: [
        `加购 ${topUp.units} 件「${topUp.item.title}」凑单（多花 ¥${topUp.overflow.toFixed(2)}，净省 ¥${topUp.netSaved.toFixed(2)}）`,
        "保留当前购物车",
      ],
    },
    pricing,
  );
}
