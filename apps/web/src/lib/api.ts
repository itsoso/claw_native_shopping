import type {
  DemoApiClient,
  DemoRunMode,
  OrderExplanationPayload,
  ReplenishmentResult,
  ScenarioId
} from "./types.js";

export class ApiUnavailableError extends Error {
  constructor(message = "buyer_api_unavailable") {
    super(message);
    this.name = "ApiUnavailableError";
  }
}

type CreateDemoApiClientOptions = {
  baseUrl?: string;
};

const resolveDemoPayload = (
  scenarioId: ScenarioId,
  runMode: DemoRunMode
): Record<string, unknown> => {
  if (runMode === "approval") {
    return {
      scenarioId,
      demo: { forceApproval: true }
    };
  }

  if (runMode === "holdFailure") {
    return {
      scenarioId,
      demo: { forceInventoryHoldFailure: true }
    };
  }

  return { scenarioId };
};

const parseJson = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw new ApiUnavailableError(`buyer_api_http_${response.status}`);
  }

  return (await response.json()) as T;
};

const withUnavailableMapping = async <T>(
  request: () => Promise<T>
): Promise<T> => {
  try {
    return await request();
  } catch (error) {
    if (error instanceof ApiUnavailableError) {
      throw error;
    }

    throw new ApiUnavailableError(error instanceof Error ? error.message : "buyer_api_unavailable");
  }
};

export const createDemoApiClient = (
  options: CreateDemoApiClientOptions = {}
): DemoApiClient => {
  const baseUrl = options.baseUrl ?? "http://127.0.0.1:3000";

  return {
    async runReplenishment(input): Promise<ReplenishmentResult> {
      return withUnavailableMapping(async () => {
        const response = await fetch(`${baseUrl}/intents/replenish`, {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify(resolveDemoPayload(input.scenarioId, input.runMode))
        });

        return parseJson<ReplenishmentResult>(response);
      });
    },
    async fetchOrderExplanation(orderId: string): Promise<OrderExplanationPayload> {
      return withUnavailableMapping(async () => {
        const response = await fetch(`${baseUrl}/orders/${orderId}/explanation`);
        return parseJson<OrderExplanationPayload>(response);
      });
    }
  };
};
