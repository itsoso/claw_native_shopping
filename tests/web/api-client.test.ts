import { describe, expect, it, vi } from "vitest";

import {
  ApiUnavailableError,
  createDemoApiClient
} from "../../apps/web/src/lib/api.js";

describe("demo api client", () => {
  it("posts scenario-aware replenish requests with demo overrides", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            status: "approvalRequired",
            orderId: "order_intent_coffee-1kg",
            reason: "approval_required",
            explanation: ["INTENT_CREATED", "POLICY_EVALUATED", "APPROVAL_REQUIRED"],
            snapshot: {
              orderId: "order_intent_coffee-1kg",
              status: "approvalWait",
              scenarioId: "office",
              category: "coffee"
            }
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" }
          }
        )
      );

    const client = createDemoApiClient({ baseUrl: "http://127.0.0.1:3000" });
    const result = await client.runReplenishment({
      scenarioId: "office",
      runMode: "approval"
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:3000/intents/replenish",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          scenarioId: "office",
          demo: { forceApproval: true }
        })
      })
    );
    expect(result.status).toBe("approvalRequired");
  });

  it("maps network failures to an unavailable error", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("connect ECONNREFUSED"));

    const client = createDemoApiClient({ baseUrl: "http://127.0.0.1:3000" });

    await expect(
      client.fetchOrderExplanation("order_intent_egg-12")
    ).rejects.toBeInstanceOf(ApiUnavailableError);
  });
});
