export type ValidationRuntime = "demo" | "live";

export type ScenarioId =
  | "replenish-laundry"
  | "optimize-cart-threshold"
  | "seller-eta-tradeoff";

export type ScenarioMode = "time_saving" | "safe" | "value";

export type ScenarioDefinition = {
  id: ScenarioId;
  title: string;
  summary: string;
  tags: readonly string[];
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
  signals: readonly string[];
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
