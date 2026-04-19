import type { ScenarioDefinition } from "../runtime/types.js";

/**
 * Investor-safe preset scenarios. Order matters — the picker and the
 * default-scenario selection read from this registry in array order.
 */
export const demoScenarios: ScenarioDefinition[] = [
  {
    id: "replenish-laundry",
    label: "补货：洗衣液",
    description:
      "用户家的洗衣液快用完；OpenClaw 替用户完成从识别需求到下单的全流程。",
    preferredMode: "time_saving",
    tagline: "OpenClaw 接管补货，不让用户翻页挑选",
  },
  {
    id: "optimize-cart-threshold",
    label: "购物车凑单阈值",
    description:
      "购物车已有商品，OpenClaw 根据满减规则在不超预算的前提下凑单最优组合。",
    preferredMode: "cost_saving",
    tagline: "OpenClaw 调整组合命中满减档位",
  },
  {
    id: "seller-eta-tradeoff",
    label: "卖家 ETA 权衡",
    description:
      "多个卖家可供货，OpenClaw 在 ETA / 成本 / 信用间按既定策略权衡决策。",
    preferredMode: "cautious",
    tagline: "OpenClaw 在 ETA 与成本间按策略权衡",
  },
];
