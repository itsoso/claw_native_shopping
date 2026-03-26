import { describe, expect, it } from "vitest";

import { buildSellerSimServer } from "../../apps/seller-sim/src/server.js";
import { createSellerHttpPort } from "../../packages/seller-protocol/src/httpPort.js";

describe("seller http port", () => {
  it("drives quote, hold, and commit against seller-sim over HTTP", async () => {
    const app = buildSellerSimServer();
    await app.listen({ host: "127.0.0.1", port: 0 });

    const address = app.server.address();
    if (!address || typeof address === "string") {
      throw new Error("seller_sim_address_unavailable");
    }

    const port = createSellerHttpPort({
      baseUrl: `http://127.0.0.1:${address.port}`,
    });

    try {
      const rfq = {
        rfqId: "rfq_1",
        buyerAgentId: "buyer_1",
        category: "eggs",
        quantity: 2,
      };

      const quote = await port.requestQuote(rfq);
      const hold = await port.holdInventory(quote);
      const commit = await port.commitOrder({ rfq, quote, hold });

      expect(quote.rfqId).toBe("rfq_1");
      expect(hold.quoteId).toBe(quote.quoteId);
      expect(commit.orderId).toBe("order_rfq_1");
    } finally {
      await app.close();
    }
  });

  it("throws a stable error when seller-sim returns a non-2xx response", async () => {
    const app = buildSellerSimServer();
    await app.listen({ host: "127.0.0.1", port: 0 });

    const address = app.server.address();
    if (!address || typeof address === "string") {
      throw new Error("seller_sim_address_unavailable");
    }

    const port = createSellerHttpPort({
      baseUrl: `http://127.0.0.1:${address.port}`,
    });

    try {
      await expect(
        port.requestQuote({
          rfqId: "rfq_missing",
          buyerAgentId: "buyer_1",
          category: "unknown-category",
          quantity: 1,
        }),
      ).rejects.toThrow(/seller request failed: POST \/rfq returned HTTP 404/);
    } finally {
      await app.close();
    }
  });
});
