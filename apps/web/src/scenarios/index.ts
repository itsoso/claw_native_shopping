import type { ScenarioDefinition } from "../runtime/types.js";

export const demoScenarios: readonly ScenarioDefinition[] = [
  {
    id: "replenish-laundry",
    title: "补货日常洗衣液",
    summary: "演示 OpenClaw 如何接管高频日用品复购决策。",
    tags: ["replenishment", "daily-use", "demo"],
  },
  {
    id: "optimize-cart-threshold",
    title: "优化购物车满减门槛",
    summary: "演示 OpenClaw 如何帮用户更快完成整单凑单。",
    tags: ["cart", "threshold", "demo"],
  },
  {
    id: "seller-eta-tradeoff",
    title: "卖家时效与价格权衡",
    summary: "演示 OpenClaw 如何解释时效、价格和稳定性的取舍。",
    tags: ["eta", "price", "demo"],
  },
];
