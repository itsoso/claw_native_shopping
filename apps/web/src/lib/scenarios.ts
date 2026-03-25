import type {
  DemoRunMode,
  ScenarioId,
  ScenarioPresentation
} from "./types.js";

export const runModeLabel: Record<DemoRunMode, string> = {
  standard: "标准路径",
  approval: "需要审批",
  holdFailure: "锁库失败"
};

export const scenarioById: Record<ScenarioId, ScenarioPresentation> = {
  home: {
    id: "home",
    tabLabel: "家庭冰箱补货",
    eyebrow: "Household Autopilot",
    heading: "你的冰箱正在等待下一次自动补货",
    description:
      "OpenClaw 先看见鸡蛋、牛奶和纸巾的缺口，再决定是否替你发起一次补货。",
    ctaLabel: "为这个家发起自动补货",
    policySummary: "预算 50 元内自动执行，超出时请求确认",
    inventoryCards: [
      { name: "鸡蛋", onHand: 2, reorderPoint: 4, note: "明早前需要补到 4 份" },
      { name: "牛奶", onHand: 1, reorderPoint: 3, note: "儿童早餐会在 2 天内耗尽" },
      { name: "厨房纸", onHand: 0, reorderPoint: 2, note: "清洁耗材已经低于阈值" }
    ]
  },
  office: {
    id: "office",
    tabLabel: "办公室 / 门店补货",
    eyebrow: "Ops Replenishment",
    heading: "让门店和办公室的高频耗材自动归位",
    description:
      "把咖啡豆、瓶装水和清洁用品的补货交给代理，只在超预算或异常时叫你。",
    ctaLabel: "为办公室发起自动补货",
    policySummary: "预算 120 元内自动执行，优先可信卖家与稳定交付",
    inventoryCards: [
      { name: "咖啡豆", onHand: 1, reorderPoint: 4, note: "吧台高峰期前需要补仓" },
      { name: "瓶装水", onHand: 8, reorderPoint: 18, note: "会议和访客消耗超预期" },
      { name: "清洁喷雾", onHand: 1, reorderPoint: 3, note: "门店收档后会消耗完本周库存" }
    ]
  }
};

export const scenarioList = [
  scenarioById.home,
  scenarioById.office
] satisfies ScenarioPresentation[];
