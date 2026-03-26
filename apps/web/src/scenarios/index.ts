import type { ScenarioDefinition, ScenarioId, ScenarioMode } from "../runtime/types.js";

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

export type DemoScenarioFixture = ScenarioDefinition & {
  summary: string;
  signals: readonly string[];
  steps: {
    demand: string;
    decision: string;
    cartPlan: string;
    sellerOrder: string;
    explanation: string;
  };
};

const demoScenarioEntries: readonly [ScenarioId, DemoScenarioFixture][] = [
  [
    "replenish-laundry",
    {
      id: "replenish-laundry",
      title: "补货日常洗衣液",
      summary: "演示 OpenClaw 如何接管高频日用品复购决策。",
      tags: ["replenishment", "daily-use", "demo"],
      signals: ["replenishment", "repeat-purchase", "time_saving"],
      steps: {
        demand: "识别日常洗衣液即将用尽，并锁定补货目标。",
        decision: "优先选择自营、次日达、规格稳定的常购款。",
        cartPlan: "组合现有购物车和补货项，尽量减少用户操作。",
        sellerOrder: "将订单路由到可解释、可追踪的默认履约路径。",
        explanation: "说明为什么当前选择更省时、风险更低、可直接确认。",
      },
    },
  ],
  [
    "optimize-cart-threshold",
    {
      id: "optimize-cart-threshold",
      title: "优化购物车满减门槛",
      summary: "演示 OpenClaw 如何帮用户更快完成整单凑单。",
      tags: ["cart", "threshold", "demo"],
      signals: ["cart-optimization", "threshold", "value"],
      steps: {
        demand: "识别购物车距离满减门槛的差额。",
        decision: "建议最少新增或替换的商品组合。",
        cartPlan: "把凑单动作收敛到最少操作数。",
        sellerOrder: "保持订单结构清晰，便于后续复核。",
        explanation: "解释为何这个组合在时间成本和优惠收益之间最平衡。",
      },
    },
  ],
  [
    "seller-eta-tradeoff",
    {
      id: "seller-eta-tradeoff",
      title: "卖家时效与价格权衡",
      summary: "演示 OpenClaw 如何解释时效、价格和稳定性的取舍。",
      tags: ["eta", "price", "demo"],
      signals: ["eta", "price", "safe"],
      steps: {
        demand: "识别用户对时效、价格和稳定性的约束。",
        decision: "在更快与更省之间选出默认安全解。",
        cartPlan: "整理成可执行的单一购买路径。",
        sellerOrder: "优先保留更稳定的履约链路。",
        explanation: "说明为什么该方案更符合当前模式下的风险偏好。",
      },
    },
  ],
];

export const demoScenarioFixtures = Object.fromEntries(demoScenarioEntries) as Readonly<
  Record<ScenarioId, DemoScenarioFixture>
>;

export const getDemoScenarioFixture = (scenarioId: ScenarioId): DemoScenarioFixture =>
  demoScenarioFixtures[scenarioId];

export const getDemoScenarioSummary = (
  scenarioId: ScenarioId,
  mode: ScenarioMode,
): string => {
  const scenario = getDemoScenarioFixture(scenarioId);

  if (mode === "time_saving") {
    return `OpenClaw 帮你用更少时间完成 ${scenario.title}，不需要额外判断。`;
  }

  if (mode === "safe") {
    return `OpenClaw 先给出更稳妥的默认解，再把原因解释清楚：${scenario.summary}`;
  }

  return `OpenClaw 把 ${scenario.title} 收敛成更划算、可执行的购买方案。`;
};
