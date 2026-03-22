import { describe, expect, it } from "vitest";
import { buildSellerSimServer } from "../../apps/seller-sim/src/server.js";
import { requestQuote } from "../helpers/request-quote.js";

describe("seller simulator", () => {
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
      const quoteResponse = await app.inject({
        method: "POST",
        url: "/rfq",
        payload: {
          rfqId: "rfq_1",
          buyerAgentId: "buyer_1",
          category: "eggs",
          quantity: 2
        }
      });
      const quote = quoteResponse.json() as { quoteId: string };

      const holdResponse = await app.inject({
        method: "POST",
        url: `/quotes/${quote.quoteId}/hold`
      });

      expect(holdResponse.statusCode).toBe(200);
      expect(holdResponse.json().quoteId).toBe(quote.quoteId);
    } finally {
      await app.close();
    }
  });
});
