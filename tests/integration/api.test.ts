import { describe, expect, it } from "vitest";
import { buildServer } from "../../apps/api/src/server.js";

describe("buyer api", () => {
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
