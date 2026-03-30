import {
  getDemoScenarioFixture,
  getDemoScenarioOutcome,
  getDemoScenarioSummary,
} from "../scenarios/index.js";
import type { LiveReplenishmentRequest } from "../../../../packages/contracts/src/live-replenishment.js";
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
    selectedScenarioId?: string;
    selectedMode?: string;
    requestedCategory?: string;
    requestedQuantity?: number;
    budgetLimit?: number;
    deliveryWindowLatestAt?: string;
    sellerAgentId?: string;
    rankedOfferCount?: number;
    selectedOfferScore?: number;
  };
};

const DEFAULT_LIVE_API_BASE_URL = "/api/live";
const DEFAULT_LIVE_SELLER_BASE_URL = "/seller/live";
const modeCopy: Record<ScenarioMode, string> = {
  time_saving: "更省时间",
  safe: "更稳妥",
  value: "更划算",
};
const categoryLabelMap: Record<string, string> = {
  "laundry-detergent": "家庭鸡蛋补货",
  "cart-threshold-booster": "办公室咖啡豆补货",
  "seller-eta-balance": "冷链牛奶补货",
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
  const defaultMessage =
    status === "ok"
      ? `${payload.service ?? fallbackService} 已连接`
      : `${payload.service ?? fallbackService} 状态待确认`;

  return {
    status,
    checkedAt: new Date().toISOString(),
    message: payload.message ?? defaultMessage,
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

const formatCategoryLabel = (category: string): string => {
  return categoryLabelMap[category] ?? category;
};

const buildLiveSteps = (
  scenarioId: ScenarioId,
  mode: ScenarioMode,
  orderId: string,
  snapshot: NonNullable<LiveExplanationResponse["snapshot"]>,
  explanationEvents: readonly string[],
): RunStepViewModel[] => {
  const scenario = getDemoScenarioFixture(scenarioId);
  const requestedCategory = formatCategoryLabel(
    snapshot.requestedCategory ?? "未知补货品类",
  );
  const requestedQuantity = snapshot.requestedQuantity ?? "unknown-quantity";
  const budgetLimit = snapshot.budgetLimit ?? "unknown-budget";
  const deliveryWindowLatestAt = snapshot.deliveryWindowLatestAt ?? "unknown-window";
  const sellerAgentId = snapshot.sellerAgentId ?? "unknown-seller";
  const snapshotStatus = snapshot.status ?? "unknown";
  const rankedOfferCount = snapshot.rankedOfferCount;
  const selectedOfferScore = snapshot.selectedOfferScore;
  const rankingDetail =
    typeof rankedOfferCount === "number" && rankedOfferCount > 1
      ? ` 已比较 ${rankedOfferCount} 个卖家候选${
          typeof selectedOfferScore === "number"
            ? `，并选中了评分 ${selectedOfferScore.toFixed(3)} 的方案`
            : ""
        }。`
      : "";

  return [
    createStep(
      "demand",
      "需求触发",
      `${scenario.title}：采购引擎已发起 ${requestedQuantity} 份${requestedCategory}的补货请求。`,
    ),
    createStep(
      "decision",
      "策略判断",
      `${modeCopy[mode]}模式下，预算上限为 ${budgetLimit}，最晚送达时间为 ${deliveryWindowLatestAt}。${rankingDetail}`,
    ),
    createStep(
      "cart-plan",
      "采购路径",
      `联调订单 ${orderId} 已通过 buyer API 的编排链路生成，对应场景 ${snapshot.selectedScenarioId ?? scenarioId}。`,
    ),
    createStep(
      "seller-order",
      "卖家执行",
      typeof rankedOfferCount === "number" && rankedOfferCount > 1
        ? `seller-sim 已返回 ${rankedOfferCount} 个排序报价，并与 ${sellerAgentId} 完成询价、锁库和提交；订单状态为 ${snapshotStatus}。`
        : `seller-sim 已返回 ${sellerAgentId} 的询价、锁库和提交结果；订单状态为 ${snapshotStatus}。`,
    ),
    createStep(
      "explanation",
      "决策解释",
      explanationEvents.length > 0
        ? `审计事件链：${explanationEvents.join("、")}`
        : "本次联调没有返回额外的审计事件。",
    ),
  ];
};

export const createLiveRuntime = (options: LiveRuntimeOptions): LiveRuntime => {
  const fetchImpl = options.fetch ?? fetch;
  const apiBaseUrl = options.apiBaseUrl ?? DEFAULT_LIVE_API_BASE_URL;
  const sellerBaseUrl = options.sellerBaseUrl ?? DEFAULT_LIVE_SELLER_BASE_URL;

  return {
    async run(scenarioId, mode) {
      const liveRequest: LiveReplenishmentRequest = {
        scenarioId,
        mode,
      };
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
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(liveRequest),
        },
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
          explanation.snapshot ?? {},
          explanationEvents,
        ),
        explanationTags: scenario.explanationTags,
        outcome: getDemoScenarioOutcome(scenarioId, mode),
        health: {
          api: apiHealth,
          seller: sellerHealth,
        },
      };
    },
  };
};
