import type {
  RunStepViewModel,
  RunViewModel,
  ScenarioId,
  ScenarioMode,
} from "./types.js";
import { getDemoScenarioFixture, getDemoScenarioSummary } from "../scenarios/index.js";

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
  message: "demo runtime active",
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
      buildStep("demand", "Demand", scenario.steps.demand),
      buildStep("decision", "Decision", scenario.steps.decision),
      buildStep("cart-plan", "Cart Plan", scenario.steps.cartPlan),
      buildStep("seller-order", "Seller Order", scenario.steps.sellerOrder),
      buildStep("explanation", "Explanation", scenario.steps.explanation),
    ],
    explanationTags: scenario.explanationTags,
    health: {
      api: createDemoHealth(),
      seller: createDemoHealth(),
    },
  };
};
