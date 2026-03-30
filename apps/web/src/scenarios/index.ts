import type {
  ScenarioDefinition,
  ScenarioId,
  ScenarioMode,
  ScenarioOutcomeDefinition,
} from "../runtime/types.js";

export const demoScenarios: readonly ScenarioDefinition[] = [
  {
    id: "replenish-laundry",
    label: "家庭默认",
    title: "补货冰箱鸡蛋",
    summary: "演示 OpenClaw 如何根据家庭库存、预算和偏好完成一次默认补货。",
    tags: ["家庭补货", "冰箱库存", "高频复购"],
    signals: [
      { label: "当前库存", value: "鸡蛋剩余 2 枚", note: "低于家庭早餐阈值 6 枚" },
      { label: "下次需求", value: "明早 7:30 前需要补齐", note: "覆盖 2 天早餐计划" },
    ],
    guardrails: [
      { label: "预算保护", value: "单次预算不超过 45 元" },
      { label: "默认偏好", value: "优先散养、常购规格、次日晨配" },
    ],
  },
  {
    id: "optimize-cart-threshold",
    label: "办公室采购",
    title: "办公室咖啡豆补货",
    summary: "演示 OpenClaw 如何把门店或办公室的耗材采购收敛成单次执行。",
    tags: ["办公室采购", "耗材补货", "预算控制"],
    signals: [
      { label: "库存告警", value: "咖啡豆剩余 1 袋", note: "不足以覆盖本周二到周三" },
      { label: "连带需求", value: "纸巾也接近补货点", note: "适合合并成一次行政采购" },
    ],
    guardrails: [
      { label: "预算保护", value: "单次预算不超过 120 元" },
      { label: "审批规则", value: "办公室场景优先走自动审批" },
    ],
  },
  {
    id: "seller-eta-tradeoff",
    label: "家庭权衡",
    title: "冷链牛奶时效与价格权衡",
    summary: "演示 OpenClaw 如何在送达时效、价格和稳定性之间给出默认选择。",
    tags: ["时效权衡", "价格敏感", "家庭饮食"],
    signals: [
      { label: "库存告警", value: "冷链牛奶已断货", note: "今晚前需要补回 2 瓶" },
      { label: "履约要求", value: "必须 4 小时内送达", note: "避免冷链断链和第二次下单" },
    ],
    guardrails: [
      { label: "预算保护", value: "单次预算不超过 45 元" },
      { label: "风险保护", value: "优先更稳的冷链卖家，再考虑低价" },
    ],
  },
];

export type DemoScenarioFixture = ScenarioDefinition & {
  summary: string;
  explanationTags: readonly string[];
  outcomes: Record<ScenarioMode, ScenarioOutcomeDefinition>;
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
      signals: [
        { label: "当前库存", value: "鸡蛋剩余 2 枚", note: "低于家庭早餐阈值 6 枚" },
        { label: "下次需求", value: "明早 7:30 前需要补齐", note: "覆盖 2 天早餐计划" },
      ],
      guardrails: [
        { label: "预算保护", value: "单次预算不超过 45 元" },
        { label: "默认偏好", value: "优先散养、常购规格、次日晨配" },
      ],
      explanationTags: ["家庭补货", "高频复购", "更省时间"],
      outcomes: {
        time_saving: {
          itemLabel: "散养鸡蛋 12 枚",
          decisionLabel: "无需人工审批",
          detail: "系统会优先下单家庭常购规格，并保留明早前送达的履约余量。",
          note: "自动成交前仍会校验预算、库存锁定和卖家信誉。",
        },
        safe: {
          itemLabel: "可追溯散养鸡蛋 10 枚",
          decisionLabel: "低风险自动下单",
          detail: "更稳妥模式会略微降低数量，优先选择售后更清晰的卖家路径。",
          note: "如果卖家资质不足，会立即转成人工确认。",
        },
        value: {
          itemLabel: "家庭装鸡蛋 12 枚",
          decisionLabel: "若超预算则提醒确认",
          detail: "更划算模式会优先比价，但不会突破家庭的单次预算阈值。",
          note: "只有明显更便宜且履约分不掉档时才会替换常购品牌。",
        },
      },
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
      signals: [
        { label: "库存告警", value: "咖啡豆剩余 1 袋", note: "不足以覆盖本周二到周三" },
        { label: "连带需求", value: "纸巾也接近补货点", note: "适合合并成一次行政采购" },
      ],
      guardrails: [
        { label: "预算保护", value: "单次预算不超过 120 元" },
        { label: "审批规则", value: "办公室场景优先走自动审批" },
      ],
      explanationTags: ["办公室采购", "预算控制", "更划算"],
      outcomes: {
        time_saving: {
          itemLabel: "商用咖啡豆 1kg + 纸巾 2 提",
          decisionLabel: "无需重复审批",
          detail: "系统会把两项低风险耗材合并成一笔行政采购，减少人工往返确认。",
          note: "默认只走办公室白名单卖家。",
        },
        safe: {
          itemLabel: "商用咖啡豆 1kg",
          decisionLabel: "需要负责人复核",
          detail: "更稳妥模式会优先缩小采购范围，只保留最核心的耗材补货。",
          note: "办公室采购会把异常价格和拆单行为显式暴露出来。",
        },
        value: {
          itemLabel: "商用咖啡豆 1kg + 阈值补货纸巾",
          decisionLabel: "控制在预算内自动成交",
          detail: "更划算模式会利用凑单阈值压低总价，但不放弃默认履约稳定性。",
          note: "如果单价异常波动，会退回更稳妥模式。",
        },
      },
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
      signals: [
        { label: "库存告警", value: "冷链牛奶已断货", note: "今晚前需要补回 2 瓶" },
        { label: "履约要求", value: "必须 4 小时内送达", note: "避免冷链断链和第二次下单" },
      ],
      guardrails: [
        { label: "预算保护", value: "单次预算不超过 45 元" },
        { label: "风险保护", value: "优先更稳的冷链卖家，再考虑低价" },
      ],
      explanationTags: ["时效优先", "风险控制", "更稳妥"],
      outcomes: {
        time_saving: {
          itemLabel: "冷链鲜牛奶 950ml",
          decisionLabel: "优先更快送达",
          detail: "省时间模式会优先锁定更快的冷链履约路径，减少晚餐前断货风险。",
          note: "只有在配送时效明确领先时才会接受更高单价。",
        },
        safe: {
          itemLabel: "冷链鲜牛奶 950ml",
          decisionLabel: "优先稳定卖家",
          detail: "更稳妥模式会优先保留履约评分更高的卖家，即便价格不是最低。",
          note: "如果报价差距过大，会提示用户确认是否接受低价卖家。",
        },
        value: {
          itemLabel: "冷链鲜牛奶 950ml",
          decisionLabel: "在 45 元内自动成交",
          detail: "更划算模式会选择总价更低、但仍满足冷链时效底线的卖家报价。",
          note: "系统会保留卖家比较结果，方便用户回看为什么没有选最低价。",
        },
      },
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

export const getDemoScenarioOutcome = (
  scenarioId: ScenarioId,
  mode: ScenarioMode,
): ScenarioOutcomeDefinition => {
  const scenario = getDemoScenarioFixture(scenarioId);

  return scenario.outcomes[mode];
};
