import type {
  RunStepViewModel,
  RunViewModel,
  ScenarioId,
  ScenarioMode,
} from "./types.js";
import {
  getDemoScenarioFixture,
  getDemoScenarioOutcome,
  getDemoScenarioSummary,
} from "../scenarios/index.js";

const buildStep = (
  id: RunStepViewModel["id"],
  title: string,
  detail: string,
): RunStepViewModel => ({
  id,
  title,
  status: "complete",
  detail,
});

const createDemoHealth = () => ({
  status: "ok" as const,
  message: "演示路径已激活",
});

export const runDemoScenario = async (
  scenarioId: ScenarioId,
  mode: ScenarioMode,
): Promise<RunViewModel> => {
  const scenario = getDemoScenarioFixture(scenarioId);

  return {
    scenarioId,
    runtime: "demo",
    mode,
    summary: getDemoScenarioSummary(scenarioId, mode),
    steps: [
      buildStep("demand", "需求触发", scenario.steps.demand),
      buildStep("decision", "策略判断", scenario.steps.decision),
      buildStep("cart-plan", "采购路径", scenario.steps.cartPlan),
      buildStep("seller-order", "卖家执行", scenario.steps.sellerOrder),
      buildStep("explanation", "决策解释", scenario.steps.explanation),
    ],
    explanationTags: scenario.explanationTags,
    outcome: getDemoScenarioOutcome(scenarioId, mode),
    health: {
      api: createDemoHealth(),
      seller: createDemoHealth(),
    },
  };
};
