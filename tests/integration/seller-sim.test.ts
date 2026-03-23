import { describe, expect, it } from "vitest";
import {
  buildSellerSimServer,
  startSellerSimServer
} from "../../apps/seller-sim/src/server.js";
import { createSellerSimProtocolPort, requestQuote } from "../helpers/request-quote.js";

describe("seller simulator", () => {
  it("can start a real HTTP listener", async () => {
    const { app, baseUrl } = await startSellerSimServer({
      port: 0,
      host: "127.0.0.1"
    });

    try {
      const response = await fetch(`${baseUrl}/rfq`, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          rfqId: "rfq_runtime",
          buyerAgentId: "buyer_1",
          category: "eggs",
          quantity: 2
        })
      });

      expect(response.status).toBe(200);
    } finally {
      await app.close();
    }
  });

  it("returns a quote for supported RFQs", async () => {
    const quote = await requestQuote({
      category: "eggs",
      quantity: 2
    });

    expect(quote.items[0]?.quantity).toBe(2);
  });

  it("returns an inventory hold for a known quote", async () => {
    const app = buildSellerSimServer();

    try {
      const port = createSellerSimProtocolPort(app);
      const quote = await port.requestQuote({
        rfqId: "rfq_1",
        buyerAgentId: "buyer_1",
        category: "eggs",
        quantity: 2
      });

      const hold = await port.holdInventory({
        ...quote
      });

      const commit = await port.commitOrder({
        rfq: {
          rfqId: quote.rfqId,
          buyerAgentId: "buyer_1",
          category: "eggs",
          quantity: 2
        },
        quote,
        hold
      });

      expect(hold.quoteId).toBe(quote.quoteId);
      expect(commit.orderId).toBe("order_rfq_1");
    } finally {
      await app.close();
    }
  });
});
