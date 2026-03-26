import { getDemoScenarioFixture, getDemoScenarioSummary } from "../scenarios/index.js";
import type {
  LiveRuntime,
  LiveRuntimeOptions,
  RunStepViewModel,
  RunViewModel,
  ScenarioId,
  ScenarioMode,
  ServiceHealthViewModel,
} from "./types.js";

type HealthProbeResponse = {
  service?: string;
  status?: string;
  message?: string;
};

type LiveIntentResponse = {
  orderId: string;
};

type LiveExplanationResponse = {
  orderId: string;
  explanation?: Array<{ event?: string; type?: string }>;
  snapshot?: {
    orderId?: string;
    status?: string;
  };
};

const createStep = (
  id: RunStepViewModel["id"],
  title: string,
  detail: string,
): RunStepViewModel => ({
  id,
  title,
  status: "complete",
  detail,
});

const buildUrl = (baseUrl: string, path: string): string =>
  new URL(path, baseUrl).toString();

const normalizeHealth = (
  payload: HealthProbeResponse,
  fallbackService: string,
): ServiceHealthViewModel => {
  const status =
    payload.status === "ok" || payload.status === "error" ? payload.status : "unknown";

  return {
    status,
    checkedAt: new Date().toISOString(),
    message: payload.message ?? `${payload.service ?? fallbackService} probe complete`,
  };
};

const extractExplanationTags = (response: LiveExplanationResponse): readonly string[] => {
  return (
    response.explanation
      ?.map((event) => event.event ?? event.type)
      .filter((value): value is string => typeof value === "string" && value.length > 0) ?? []
  );
};

const buildLiveSteps = (
  scenarioId: ScenarioId,
  mode: ScenarioMode,
  orderId: string,
  snapshotStatus: string,
  explanationTags: readonly string[],
): RunStepViewModel[] => {
  const scenario = getDemoScenarioFixture(scenarioId);

  return [
    createStep("demand", "Demand", `${scenario.title}: buyer API accepted the live request.`),
    createStep("decision", "Decision", `Mode ${mode} mapped to a live decision path.`),
    createStep("cart-plan", "Cart Plan", `Live order ${orderId} was prepared for execution.`),
    createStep("seller-order", "Seller Order", `Snapshot status reported as ${snapshotStatus}.`),
    createStep(
      "explanation",
      "Explanation",
      explanationTags.length > 0
        ? `Audit trail events: ${explanationTags.join(", ")}`
        : "Audit trail events were not returned.",
    ),
  ];
};

export const createLiveRuntime = (options: LiveRuntimeOptions): LiveRuntime => {
  const fetchImpl = options.fetch ?? fetch;

  return {
    async run(scenarioId, mode) {
      const [apiHealthResponse, sellerHealthResponse] = await Promise.all([
        fetchImpl(buildUrl(options.apiBaseUrl, "/health")),
        fetchImpl(buildUrl(options.sellerBaseUrl, "/health")),
      ]);

      const apiHealth = normalizeHealth(
        (await apiHealthResponse.json()) as HealthProbeResponse,
        "buyer-api",
      );
      const sellerHealth = normalizeHealth(
        (await sellerHealthResponse.json()) as HealthProbeResponse,
        "seller-sim",
      );

      const replenishResponse = await fetchImpl(
        buildUrl(options.apiBaseUrl, "/intents/replenish"),
        { method: "POST" },
      );
      const replenish = (await replenishResponse.json()) as LiveIntentResponse;

      const explanationResponse = await fetchImpl(
        buildUrl(options.apiBaseUrl, `/orders/${replenish.orderId}/explanation`),
      );
      const explanation = (await explanationResponse.json()) as LiveExplanationResponse;

      const scenario = getDemoScenarioFixture(scenarioId);
      const explanationTags = extractExplanationTags(explanation);

      return {
        scenarioId,
        runtime: "live",
        mode,
        summary: getDemoScenarioSummary(scenarioId, mode),
        steps: buildLiveSteps(
          scenarioId,
          mode,
          replenish.orderId,
          explanation.snapshot?.status ?? "unknown",
          explanationTags,
        ),
        explanationTags:
          explanationTags.length > 0 ? explanationTags : scenario.explanationTags,
        health: {
          api: apiHealth,
          seller: sellerHealth,
        },
      };
    },
  };
};
