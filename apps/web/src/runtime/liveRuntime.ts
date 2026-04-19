/**
 * Live runtime for the Web validation console.
 *
 * Probes /health on both services, then runs a single replenish intent
 * against the buyer API and fetches the resulting order explanation.
 * Projects everything into the shared `RunViewModel` — the UI does not
 * branch on runtime.
 *
 * This adapter is intentionally MVP: it does NOT branch per scenario.
 * Scenario-specific flows live in the backend; this is the "live demo"
 * that proves the pipe is healthy and explainable.
 */
import type {
  DecisionMode,
  RunStepViewModel,
  RunViewModel,
  ServiceHealth,
} from "./types.js";

export interface LiveRuntimeOptions {
  apiBaseUrl: string;
  sellerBaseUrl: string;
  /** Injectable for unit tests. Defaults to global `fetch`. */
  fetch?: typeof fetch;
}

export interface LiveRuntime {
  run(scenarioId: string, mode: DecisionMode): Promise<RunViewModel>;
}

const nowIso = (): string => new Date().toISOString();

async function probeHealth(
  url: string,
  fallbackService: string,
  doFetch: typeof fetch,
): Promise<ServiceHealth> {
  try {
    const res = await doFetch(`${url}/health`);
    if (!res.ok) {
      return { status: "unavailable", service: fallbackService, note: `http ${res.status}` };
    }
    const body = (await res.json()) as { status?: string; service?: string };
    return body.status === "ok"
      ? { status: "ok", service: body.service ?? fallbackService }
      : { status: "unavailable", service: fallbackService, note: "non-ok payload" };
  } catch (error) {
    return {
      status: "unavailable",
      service: fallbackService,
      note: error instanceof Error ? error.message : "network error",
    };
  }
}

export function createLiveRuntime(options: LiveRuntimeOptions): LiveRuntime {
  const { apiBaseUrl, sellerBaseUrl } = options;
  const doFetch = options.fetch ?? fetch;

  async function run(scenarioId: string, mode: DecisionMode): Promise<RunViewModel> {
    const [api, seller] = await Promise.all([
      probeHealth(apiBaseUrl, "buyer-api", doFetch),
      probeHealth(sellerBaseUrl, "seller-sim", doFetch),
    ]);

    const steps: RunStepViewModel[] = [
      { id: "demand", title: "Demand", body: `Live: ${scenarioId} / ${mode}`, at: nowIso() },
    ];

    if (api.status !== "ok" || seller.status !== "ok") {
      // Service unavailable — return a coherent RunViewModel that the UI can show as error.
      return {
        runtime: "live",
        scenarioId,
        mode,
        summary: "Live 模式不可用；请启动 dev:api 与 dev:seller-sim 后重试。",
        steps,
        explanationTags: ["live", "degraded"],
        health: { api, seller },
      };
    }

    // 1. Fire the replenish intent on the buyer API.
    const replenishRes = await doFetch(`${apiBaseUrl}/intents/replenish`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ scenarioId, mode }),
    });
    const replenishBody = (await replenishRes.json()) as { orderId?: string };
    const orderId = replenishBody.orderId ?? "unknown";
    steps.push({
      id: "decision",
      title: "Decision",
      body: `buyer-api 接受 intent — order ${orderId}`,
      at: nowIso(),
    });

    // Synthetic cart-plan / seller-order steps — the real work is inside the
    // orchestrator and is summarised in the explanation response.
    steps.push({ id: "cart-plan", title: "Cart Plan", body: "orchestrator 规划购物车", at: nowIso() });
    steps.push({ id: "seller-order", title: "Seller Order", body: `提交至 seller-sim — order ${orderId}`, at: nowIso() });

    // 2. Fetch explanation (decision trace + snapshot).
    const explanationRes = await doFetch(`${apiBaseUrl}/orders/${orderId}/explanation`);
    const explanationBody = (await explanationRes.json()) as {
      orderId?: string;
      explanation?: unknown;
      snapshot?: { status?: string };
    };
    const snapshotStatus = explanationBody.snapshot?.status ?? "unknown";
    steps.push({
      id: "explanation",
      title: "Explanation",
      body: `决策已解释；订单状态 ${snapshotStatus}`,
      at: nowIso(),
    });

    return {
      runtime: "live",
      scenarioId,
      mode,
      summary: `OpenClaw live run 完成：order ${orderId} (${snapshotStatus})`,
      steps,
      explanationTags: [mode, "live", snapshotStatus],
      health: { api, seller },
    };
  }

  return { run };
}
