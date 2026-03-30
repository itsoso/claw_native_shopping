export type ValidationRuntime = "demo" | "live";

export type ScenarioId =
  | "replenish-laundry"
  | "optimize-cart-threshold"
  | "seller-eta-tradeoff";

export type ScenarioMode = "time_saving" | "safe" | "value";

export type ScenarioContextItem = {
  label: string;
  value: string;
  note?: string;
};

export type ScenarioOutcomeDefinition = {
  itemLabel: string;
  decisionLabel: string;
  detail: string;
  note?: string;
  sellerLabel: string;
  priceLabel: string;
  etaLabel: string;
  comparisonLabel: string;
};

export type ScenarioDefinition = {
  id: ScenarioId;
  label: string;
  title: string;
  summary: string;
  tags: readonly string[];
  signals: readonly ScenarioContextItem[];
  guardrails: readonly ScenarioContextItem[];
};

export type RunStepViewModel = {
  id: string;
  title: string;
  status: "pending" | "running" | "complete" | "error";
  detail?: string;
};

export type RunViewModel = {
  scenarioId: ScenarioId;
  runtime: ValidationRuntime;
  mode: ScenarioMode;
  summary: string;
  steps: RunStepViewModel[];
  explanationTags: readonly string[];
  outcome: ScenarioOutcomeDefinition;
  health: {
    api: ServiceHealthViewModel;
    seller: ServiceHealthViewModel;
  };
};

export type ServiceHealthViewModel = {
  status: "unknown" | "ok" | "error";
  checkedAt?: string;
  message?: string;
};

export type LiveRuntimeOptions = {
  apiBaseUrl?: string;
  sellerBaseUrl?: string;
  fetch?: typeof fetch;
};

export type LiveRuntime = {
  run(scenarioId: ScenarioId, mode: ScenarioMode): Promise<RunViewModel>;
};
