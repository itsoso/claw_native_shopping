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
  signals: readonly string[];
  health: {
    api: "unknown" | "ok" | "error";
    seller: "unknown" | "ok" | "error";
  };
};
