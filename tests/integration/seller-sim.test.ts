import { describe, expect, it } from "vitest";
import {
  buildSellerSimServer,
  startSellerSimServer
} from "../../apps/seller-sim/src/server.js";
import { createSellerSimProtocolPort, requestQuote } from "../helpers/request-quote.js";
import { QuoteSchema } from "../../packages/seller-protocol/src/messages.js";

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

  it("returns multiple seller quote options for supported RFQs", async () => {
    const app = buildSellerSimServer();

    try {
      const response = await app.inject({
        method: "POST",
        url: "/rfq/options",
        payload: {
          rfqId: "rfq_options",
          buyerAgentId: "buyer_1",
          category: "laundry-detergent",
          quantity: 2,
        },
      });

      expect(response.statusCode).toBe(200);

      const quotes = (response.json() as unknown[]).map((value) =>
        QuoteSchema.parse(value),
      );

      expect(quotes.length).toBeGreaterThan(1);
      expect(new Set(quotes.map((quote) => quote.sellerAgentId)).size).toBeGreaterThan(1);
      expect(new Set(quotes.map((quote) => quote.items[0]?.unitPrice)).size).toBeGreaterThan(1);
    } finally {
      await app.close();
    }
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
