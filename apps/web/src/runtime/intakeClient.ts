type IntakeClientOptions = {
  fetchImpl?: typeof fetch;
  baseUrl?: string;
};

type FeedbackPayload = {
  scenarioId: string;
  rating: number;
  message: string;
};

type InterestPayload = {
  email: string;
  source?: string;
};

export type IntakeSummary = {
  feedbackCount: number;
  interestCount: number;
  recentFeedback: Array<{
    scenarioId: string;
    message: string;
    recordedAt: string;
  }>;
};

const DEFAULT_INTAKE_BASE_URL = "/api/live";

const postJson = async (
  fetchImpl: typeof fetch,
  input: string,
  payload: Record<string, unknown>,
): Promise<void> => {
  const response = await fetchImpl(input, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`intake request failed with HTTP ${response.status}`);
  }
};

export const createIntakeClient = (options: IntakeClientOptions = {}) => {
  const baseUrl = options.baseUrl ?? DEFAULT_INTAKE_BASE_URL;
  const getFetchImpl = (): typeof fetch => options.fetchImpl ?? fetch;

  return {
    async getSummary(): Promise<IntakeSummary> {
      const response = await getFetchImpl()(`${baseUrl}/intake/summary`);
      if (!response.ok) {
        throw new Error(`intake summary failed with HTTP ${response.status}`);
      }

      const payload = (await response.json()) as Partial<IntakeSummary>;
      return {
        feedbackCount:
          typeof payload.feedbackCount === "number" ? payload.feedbackCount : 0,
        interestCount:
          typeof payload.interestCount === "number" ? payload.interestCount : 0,
        recentFeedback: Array.isArray(payload.recentFeedback)
          ? payload.recentFeedback.filter(
              (entry): entry is IntakeSummary["recentFeedback"][number] =>
                typeof entry?.message === "string" &&
                typeof entry?.scenarioId === "string" &&
                typeof entry?.recordedAt === "string",
            )
          : [],
      };
    },
    submitFeedback(payload: FeedbackPayload): Promise<void> {
      return postJson(getFetchImpl(), `${baseUrl}/intake/feedback`, payload);
    },
    submitInterest(payload: InterestPayload): Promise<void> {
      return postJson(getFetchImpl(), `${baseUrl}/intake/interest`, {
        source: "release-web",
        ...payload,
      });
    },
  };
};
