import { describe, expect, it } from "vitest";
import { buildServer, startApiServer } from "../../apps/api/src/server.js";

describe("buyer api", () => {
  it("can start a real HTTP listener", async () => {
    const { app, baseUrl } = await startApiServer({
      port: 0,
      host: "127.0.0.1"
    });

    try {
      const response = await fetch(`${baseUrl}/orders/missing-order/explanation`);
      expect(response.status).toBe(404);
    } finally {
      await app.close();
    }
  });

  it("persists and returns the real procurement explanation", async () => {
    const app = buildServer();

    try {
      const replenishResponse = await app.inject({
        method: "POST",
        url: "/intents/replenish"
      });

      expect(replenishResponse.statusCode).toBe(200);

      const replenish = replenishResponse.json() as { orderId: string };
      const explanationResponse = await app.inject({
        method: "GET",
        url: `/orders/${replenish.orderId}/explanation`
      });

      expect(explanationResponse.statusCode).toBe(200);

      const explanation = explanationResponse.json() as {
        explanation: Array<{ type: string }>;
        snapshot: { status: string };
      };

      expect(explanation.explanation.map((event) => event.type)).toContain(
        "POLICY_EVALUATED"
      );
      expect(explanation.explanation.map((event) => event.type)).toContain(
        "ORDER_COMMITTED"
      );
      expect(explanation.snapshot.status).toBe("fulfillmentStarted");
    } finally {
      await app.close();
    }
  });
});
