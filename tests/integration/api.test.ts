import Fastify from "fastify";
import { describe, expect, it } from "vitest";
import { buildSellerSimServer } from "../../apps/seller-sim/src/server.js";
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
    const seller = buildSellerSimServer();
    await seller.listen({ host: "127.0.0.1", port: 0 });
    const sellerAddress = seller.server.address();
    if (!sellerAddress || typeof sellerAddress === "string") {
      throw new Error("seller_address_unavailable");
    }

    const app = buildServer({
      sellerBaseUrl: `http://127.0.0.1:${sellerAddress.port}`,
    });

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
      await seller.close();
    }
  });

  it("uses the configured seller base URL for the replenishment path", async () => {
    const seller = Fastify({ logger: false });
    seller.post("/rfq/options", async () => [
      {
        quoteId: "quote_runtime_1",
        rfqId: "intent_1",
        sellerAgentId: "seller_runtime",
        items: [{ productId: "egg-12", quantity: 2, unitPrice: 11 }],
        shippingFee: 0,
        taxFee: 0,
        deliveryEta: "2026-03-24T09:00:00+08:00",
        inventoryHoldTtlSec: 900,
        serviceTerms: {
          etaHours: 4,
          trustScore: 0.9,
          policyMatch: 1,
        },
      },
      {
        quoteId: "quote_runtime_2",
        rfqId: "intent_1",
        sellerAgentId: "seller_runtime_backup",
        items: [{ productId: "egg-12", quantity: 2, unitPrice: 14 }],
        shippingFee: 2,
        taxFee: 0,
        deliveryEta: "2026-03-25T09:00:00+08:00",
        inventoryHoldTtlSec: 900,
        serviceTerms: {
          etaHours: 20,
          trustScore: 0.6,
          policyMatch: 0.8,
        },
      },
    ]);
    seller.post("/rfq", async () => ({
      quoteId: "quote_runtime",
      rfqId: "intent_1",
      sellerAgentId: "seller_runtime",
      items: [{ productId: "egg-12", quantity: 2, unitPrice: 11 }],
      shippingFee: 0,
      taxFee: 0,
      deliveryEta: "2026-03-24T09:00:00+08:00",
      inventoryHoldTtlSec: 900,
      serviceTerms: {},
    }));
    seller.post("/quotes/:quoteId/hold", async () => ({
      holdId: "hold_runtime",
      quoteId: "quote_runtime",
      rfqId: "intent_1",
      sellerAgentId: "seller_runtime",
      expiresAt: "2026-03-24T09:15:00+08:00",
    }));
    seller.post("/orders/commit", async () => ({
      orderId: "order_intent_1",
      rfqId: "intent_1",
      quoteId: "quote_runtime",
      sellerAgentId: "seller_runtime",
      committedAt: "2026-03-23T12:10:00+08:00",
    }));

    await seller.listen({ host: "127.0.0.1", port: 0 });
    const sellerAddress = seller.server.address();
    if (!sellerAddress || typeof sellerAddress === "string") {
      throw new Error("seller_address_unavailable");
    }

    const app = buildServer({
      sellerBaseUrl: `http://127.0.0.1:${sellerAddress.port}`,
    });

    try {
      const replenishResponse = await app.inject({
        method: "POST",
        url: "/intents/replenish",
      });

      expect(replenishResponse.statusCode).toBe(200);

      const replenish = replenishResponse.json() as { orderId: string };
      const explanationResponse = await app.inject({
        method: "GET",
        url: `/orders/${replenish.orderId}/explanation`,
      });

      expect(explanationResponse.statusCode).toBe(200);

      const explanation = explanationResponse.json() as {
        snapshot: { sellerAgentId: string };
      };

      expect(explanation.snapshot.sellerAgentId).toBe("seller_runtime");
    } finally {
      await app.close();
      await seller.close();
    }
  });

  it("applies scenario and mode to the live procurement snapshot", async () => {
    const seller = buildSellerSimServer();
    await seller.listen({ host: "127.0.0.1", port: 0 });
    const sellerAddress = seller.server.address();
    if (!sellerAddress || typeof sellerAddress === "string") {
      throw new Error("seller_address_unavailable");
    }

    const app = buildServer({
      sellerBaseUrl: `http://127.0.0.1:${sellerAddress.port}`,
    });

    try {
      const replenishResponse = await app.inject({
        method: "POST",
        url: "/intents/replenish",
        payload: {
          scenarioId: "seller-eta-tradeoff",
          mode: "value",
        },
      });

      expect(replenishResponse.statusCode).toBe(200);

      const replenish = replenishResponse.json() as { orderId: string };
      const explanationResponse = await app.inject({
        method: "GET",
        url: `/orders/${replenish.orderId}/explanation`,
      });

      expect(explanationResponse.statusCode).toBe(200);

      const explanation = explanationResponse.json() as {
        explanation: Array<{ type: string }>;
        snapshot: {
          selectedScenarioId: string;
          selectedMode: string;
          requestedCategory: string;
          requestedQuantity: number;
          budgetLimit: number;
        };
      };

      expect(explanation.explanation.map((event) => event.type)).toContain(
        "REQUEST_PROFILE_APPLIED",
      );
      expect(explanation.explanation.map((event) => event.type)).toContain(
        "OFFERS_RANKED",
      );
      expect(explanation.snapshot.selectedScenarioId).toBe("seller-eta-tradeoff");
      expect(explanation.snapshot.selectedMode).toBe("value");
      expect(explanation.snapshot.requestedCategory).toBe("seller-eta-balance");
      expect(explanation.snapshot.requestedQuantity).toBe(1);
      expect(explanation.snapshot.budgetLimit).toBe(45);
      expect(explanation.snapshot.rankedOfferCount).toBeGreaterThan(1);
    } finally {
      await app.close();
      await seller.close();
    }
  });

  it("fails explicitly when the configured seller service is unavailable", async () => {
    const app = buildServer({
      sellerBaseUrl: "http://127.0.0.1:9",
    });

    try {
      const replenishResponse = await app.inject({
        method: "POST",
        url: "/intents/replenish",
      });

      expect(replenishResponse.statusCode).toBeGreaterThanOrEqual(500);
    } finally {
      await app.close();
    }
  });
});
