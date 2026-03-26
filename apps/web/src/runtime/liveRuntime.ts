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

const DEFAULT_LIVE_API_BASE_URL = "/api/live";
const DEFAULT_LIVE_SELLER_BASE_URL = "/seller/live";

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

const buildUrl = (baseUrl: string, path: string): string => {
  if (baseUrl.startsWith("http://") || baseUrl.startsWith("https://")) {
    return new URL(path, baseUrl).toString();
  }

  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");
  return `${normalizedBaseUrl}${path}`;
};

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

const parseJsonResponse = async <T>(response: Response, label: string): Promise<T> => {
  if (!response.ok) {
    throw new Error(`${label} failed with HTTP ${response.status}`);
  }

  return (await response.json()) as T;
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
  explanationEvents: readonly string[],
): RunStepViewModel[] => {
  const scenario = getDemoScenarioFixture(scenarioId);

  return [
    createStep(
      "demand",
      "Demand",
      `${scenario.title}: buyer API accepted the live request and opened a seller-sim replenishment run.`,
    ),
    createStep("decision", "Decision", `Mode ${mode} mapped to a live decision path.`),
    createStep(
      "cart-plan",
      "Cart Plan",
      `Live order ${orderId} was prepared through the buyer API orchestration path.`,
    ),
    createStep(
      "seller-order",
      "Seller Order",
      `seller-sim returned quote, hold, and commit data; snapshot status reported as ${snapshotStatus}.`,
    ),
    createStep(
      "explanation",
      "Explanation",
      explanationEvents.length > 0
        ? `Audit trail events: ${explanationEvents.join(", ")}`
        : "Audit trail events were not returned.",
    ),
  ];
};

export const createLiveRuntime = (options: LiveRuntimeOptions): LiveRuntime => {
  const fetchImpl = options.fetch ?? fetch;
  const apiBaseUrl = options.apiBaseUrl ?? DEFAULT_LIVE_API_BASE_URL;
  const sellerBaseUrl = options.sellerBaseUrl ?? DEFAULT_LIVE_SELLER_BASE_URL;

  return {
    async run(scenarioId, mode) {
      const [apiHealthResponse, sellerHealthResponse] = await Promise.all([
        fetchImpl(buildUrl(apiBaseUrl, "/health")),
        fetchImpl(buildUrl(sellerBaseUrl, "/health")),
      ]);

      const [apiHealthPayload, sellerHealthPayload] = await Promise.all([
        parseJsonResponse<HealthProbeResponse>(apiHealthResponse, "buyer-api /health"),
        parseJsonResponse<HealthProbeResponse>(sellerHealthResponse, "seller-sim /health"),
      ]);

      const apiHealth = normalizeHealth(apiHealthPayload, "buyer-api");
      const sellerHealth = normalizeHealth(sellerHealthPayload, "seller-sim");

      const replenishResponse = await fetchImpl(
        buildUrl(apiBaseUrl, "/intents/replenish"),
        { method: "POST" },
      );
      const replenish = await parseJsonResponse<LiveIntentResponse>(
        replenishResponse,
        "buyer-api POST /intents/replenish",
      );

      const explanationResponse = await fetchImpl(
        buildUrl(apiBaseUrl, `/orders/${replenish.orderId}/explanation`),
      );
      const explanation = await parseJsonResponse<LiveExplanationResponse>(
        explanationResponse,
        "buyer-api GET /orders/:id/explanation",
      );

      const scenario = getDemoScenarioFixture(scenarioId);
      const explanationEvents = extractExplanationTags(explanation);

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
          explanationEvents,
        ),
        explanationTags: scenario.explanationTags,
        health: {
          api: apiHealth,
          seller: sellerHealth,
        },
      };
    },
  };
};
