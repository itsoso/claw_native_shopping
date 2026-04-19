/**
 * Deterministic demo runtime for the OpenClaw Web validation console.
 *
 * Contract: the demo runtime does not hit any local services — it projects a
 * frozen fixture directly into `RunViewModel`. This keeps investor demos
 * insulated from service availability.
 */
import { demoScenarios } from "../scenarios/index.js";
import type {
  DecisionMode,
  RunStepViewModel,
  RunViewModel,
  ScenarioDefinition,
} from "./types.js";

const DEMO_INSTANT = "2026-03-26T09:00:00Z";

const baseSteps = (scenario: ScenarioDefinition): RunStepViewModel[] => [
  {
    id: "demand",
    title: "Demand",
    body: `识别到补货/采购需求：${scenario.label}`,
    at: DEMO_INSTANT,
  },
  {
    id: "decision",
    title: "Decision",
    body: `按 ${scenario.preferredMode} 策略生成候选决策`,
    at: DEMO_INSTANT,
  },
  {
    id: "cart-plan",
    title: "Cart Plan",
    body: "组装购物车计划（含满减 / 赠品校验）",
    at: DEMO_INSTANT,
  },
  {
    id: "seller-order",
    title: "Seller Order",
    body: "向最优卖家发出 RFQ 并提交订单",
    at: DEMO_INSTANT,
  },
  {
    id: "explanation",
    title: "Explanation",
    body: `向用户解释决策依据：${scenario.tagline}`,
    at: DEMO_INSTANT,
  },
];

function findScenario(scenarioId: string): ScenarioDefinition {
  const match = demoScenarios.find((s) => s.id === scenarioId);
  if (!match) {
    throw new Error(`unknown demo scenarioId: ${scenarioId}`);
  }
  return match;
}

/**
 * Run a demo scenario. Always resolves; deterministic output for a given
 * (scenarioId, mode) pair.
 */
export async function runDemoScenario(
  scenarioId: string,
  mode: DecisionMode,
): Promise<RunViewModel> {
  const scenario = findScenario(scenarioId);
  const steps = baseSteps(scenario);
  return {
    runtime: "demo",
    scenarioId,
    mode,
    summary: `OpenClaw 接管 "${scenario.label}" 全流程（${scenario.tagline}）`,
    steps,
    explanationTags: [scenario.preferredMode, "deterministic", "investor-safe"],
    health: {
      api: { status: "ok", service: "demo" },
      seller: { status: "ok", service: "demo" },
    },
  };
}
