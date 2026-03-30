import type { ScenarioDefinition, ScenarioId, ScenarioMode } from "../runtime/types.js";

export const demoScenarios: readonly ScenarioDefinition[] = [
  {
    id: "replenish-laundry",
    label: "家庭默认",
    title: "补货冰箱鸡蛋",
    summary: "演示 OpenClaw 如何根据家庭库存、预算和偏好完成一次默认补货。",
    tags: ["家庭补货", "冰箱库存", "高频复购"],
  },
  {
    id: "optimize-cart-threshold",
    label: "办公室采购",
    title: "办公室咖啡豆补货",
    summary: "演示 OpenClaw 如何把门店或办公室的耗材采购收敛成单次执行。",
    tags: ["办公室采购", "耗材补货", "预算控制"],
  },
  {
    id: "seller-eta-tradeoff",
    label: "家庭权衡",
    title: "冷链牛奶时效与价格权衡",
    summary: "演示 OpenClaw 如何在送达时效、价格和稳定性之间给出默认选择。",
    tags: ["时效权衡", "价格敏感", "家庭饮食"],
  },
];

export type DemoScenarioFixture = ScenarioDefinition & {
  summary: string;
  explanationTags: readonly string[];
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
      label: "家庭默认",
      title: "补货冰箱鸡蛋",
      summary: "演示 OpenClaw 如何根据家庭库存、预算和偏好完成一次默认补货。",
      tags: ["家庭补货", "冰箱库存", "高频复购"],
      explanationTags: ["家庭补货", "高频复购", "更省时间"],
      steps: {
        demand: "识别冰箱里鸡蛋库存低于阈值，并把本周早餐需求转成补货意图。",
        decision: "优先选择能在预算内稳定履约的常购规格，避免用户重复比价。",
        cartPlan: "把补货动作收敛成一次可确认的家庭采购，不要求用户重新挑选商品。",
        sellerOrder: "将订单路由到可解释、可追踪的默认履约路径，保证后续能追责。",
        explanation: "说明为什么这个默认选择既省时间，也没有突破家庭预算和偏好。",
      },
    },
  ],
  [
    "optimize-cart-threshold",
    {
      id: "optimize-cart-threshold",
      label: "办公室采购",
      title: "办公室咖啡豆补货",
      summary: "演示 OpenClaw 如何把门店或办公室的耗材采购收敛成单次执行。",
      tags: ["办公室采购", "耗材补货", "预算控制"],
      explanationTags: ["办公室采购", "预算控制", "更划算"],
      steps: {
        demand: "识别办公室咖啡豆和纸巾库存都接近补货点，并合并成一次采购任务。",
        decision: "在预算限制下优先挑选常用品项，减少团队审批成本。",
        cartPlan: "把采购动作压缩成一张可执行的采购单，便于行政或门店负责人复核。",
        sellerOrder: "保留单一履约路径，避免办公室采购拆成多单后失去可控性。",
        explanation: "解释为何这个方案兼顾成本、稳定供给和最少人工介入。",
      },
    },
  ],
  [
    "seller-eta-tradeoff",
    {
      id: "seller-eta-tradeoff",
      label: "家庭权衡",
      title: "冷链牛奶时效与价格权衡",
      summary: "演示 OpenClaw 如何在送达时效、价格和稳定性之间给出默认选择。",
      tags: ["时效权衡", "价格敏感", "家庭饮食"],
      explanationTags: ["时效优先", "风险控制", "更稳妥"],
      steps: {
        demand: "识别家庭对冷链商品的时效要求，以及对价格和品牌接受度的边界。",
        decision: "在更快送达和更低价格之间选出当前模式下更稳妥的默认解。",
        cartPlan: "把这次补货整理成一条可追踪的购买路径，而不是把判断交回给用户。",
        sellerOrder: "优先保留履约更稳定的卖家链路，降低生鲜或冷链出错概率。",
        explanation: "说明为什么这个选择更符合当前风险偏好，以及哪些地方在真实交易中需要审批。",
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
    return `OpenClaw 会先替你完成 ${scenario.title} 的默认决策，把时间成本留给真正需要人工判断的事情。`;
  }

  if (mode === "safe") {
    return `OpenClaw 会先给出更稳妥的默认解，再把原因解释清楚：${scenario.summary}`;
  }

  return `OpenClaw 会把 ${scenario.title} 收敛成更划算、可执行、仍然可追溯的购买方案。`;
};
