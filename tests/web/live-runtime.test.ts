import { describe, expect, it, vi } from "vitest";

import { createLiveRuntime } from "../../apps/web/src/runtime/liveRuntime.js";
import { demoScenarioFixtures } from "../../apps/web/src/scenarios/index.js";

describe("live runtime", () => {
  it("defaults to same-origin proxy paths when no base URLs are provided", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: "ok", service: "buyer-api" })),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: "ok", service: "seller-sim" })),
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({ orderId: "order_1" })))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            orderId: "order_1",
            explanation: [{ event: "decision_made" }],
            snapshot: {
              orderId: "order_1",
              status: "committed",
              selectedScenarioId: "replenish-laundry",
              selectedMode: "safe",
              requestedCategory: "laundry-detergent",
              requestedQuantity: 2,
              budgetLimit: 100,
              deliveryWindowLatestAt: "2026-03-24T12:00:00+08:00",
            },
          }),
        ),
      );

    const runtime = createLiveRuntime({
      fetch: fetchMock as typeof fetch,
    });

    await runtime.run("replenish-laundry", "safe");

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/live/health");
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/seller/live/health");
    expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/live/intents/replenish", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        scenarioId: "replenish-laundry",
        mode: "safe",
      }),
    });
    expect(fetchMock).toHaveBeenNthCalledWith(4, "/api/live/orders/order_1/explanation");
  });

  it("maps buyer-api and explanation responses into the shared view model", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: "ok", service: "buyer-api" })),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: "ok", service: "seller-sim" })),
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({ orderId: "order_1" })))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            orderId: "order_1",
            explanation: [{ event: "decision_made" }],
            snapshot: {
              orderId: "order_1",
              status: "committed",
              selectedScenarioId: "seller-eta-tradeoff",
              selectedMode: "safe",
              requestedCategory: "seller-eta-balance",
              requestedQuantity: 1,
              budgetLimit: 55,
              deliveryWindowLatestAt: "2026-03-24T12:00:00+08:00",
              sellerAgentId: "seller_1",
            },
          }),
        ),
      );

    const runtime = createLiveRuntime({
      apiBaseUrl: "http://127.0.0.1:3000",
      sellerBaseUrl: "http://127.0.0.1:3100",
      fetch: fetchMock as typeof fetch,
    });

    const result = await runtime.run("replenish-laundry", "safe");

    expect(result.runtime).toBe("live");
    expect(result.health.api.status).toBe("ok");
    expect(result.health.seller.status).toBe("ok");
    expect(result.explanationTags).toEqual(
      demoScenarioFixtures["replenish-laundry"].explanationTags,
    );
    expect(result.steps.find((step) => step.id === "demand")?.detail).toContain(
      "seller-eta-balance",
    );
    expect(result.steps.find((step) => step.id === "decision")?.detail).toContain(
      "55",
    );
    expect(result.steps.find((step) => step.id === "seller-order")?.detail).toContain(
      "seller_1",
    );
    expect(result.steps.find((step) => step.id === "explanation")?.detail).toContain(
      "decision_made",
    );
    expect(result.steps.some((step) => step.id === "explanation")).toBe(true);
  });

  it("fails cleanly on a non-ok health probe", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: "ok", service: "buyer-api" })),
      )
      .mockResolvedValueOnce(new Response("{}", { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ orderId: "order_1" })))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            orderId: "order_1",
            explanation: [{ event: "decision_made" }],
            snapshot: { orderId: "order_1", status: "committed" },
          }),
        ),
      );

    const runtime = createLiveRuntime({
      apiBaseUrl: "http://127.0.0.1:3000",
      sellerBaseUrl: "http://127.0.0.1:3100",
      fetch: fetchMock as typeof fetch,
    });

    await expect(runtime.run("replenish-laundry", "safe")).rejects.toThrow(
      /seller-sim \/health failed with HTTP 503/,
    );
  });
});
