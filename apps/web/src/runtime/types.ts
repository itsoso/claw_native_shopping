/**
 * Shared runtime types for the OpenClaw Web validation console.
 *
 * These types are intentionally transport-agnostic: both the deterministic
 * DemoRuntime and the LiveRuntime (HTTP-backed) project into the same
 * `RunViewModel` shape so the UI does not need to branch on the runtime.
 */

export type ValidationRuntime = "demo" | "live";

export type DecisionMode = "time_saving" | "cautious" | "cost_saving" | "safe";

export interface ScenarioDefinition {
  id: string;
  label: string;
  /** Short paragraph shown in the hero / picker. */
  description: string;
  /** Mode hint surfaced in the UI; not authoritative for the runtime. */
  preferredMode: DecisionMode;
  /** Stable human-readable tagline reused in explanation panel. */
  tagline: string;
}

export interface RunStepViewModel {
  id: "demand" | "decision" | "cart-plan" | "seller-order" | "explanation";
  title: string;
  body: string;
  /** ISO-8601 instant for display; demo runtime uses a fixed seed. */
  at?: string;
}

export interface ServiceHealth {
  status: "ok" | "unavailable";
  service: string;
  /** Optional surface-level reason for a failing probe. */
  note?: string;
}

export interface RunHealth {
  api: ServiceHealth;
  seller: ServiceHealth;
}

export interface RunViewModel {
  runtime: ValidationRuntime;
  scenarioId: string;
  mode: DecisionMode;
  summary: string;
  steps: RunStepViewModel[];
  explanationTags: string[];
  health: RunHealth;
}
