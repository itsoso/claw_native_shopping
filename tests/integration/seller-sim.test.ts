import { describe, expect, it } from "vitest";
import { buildSellerSimServer } from "../../apps/seller-sim/src/server.js";
import { createSellerSimProtocolPort, requestQuote } from "../helpers/request-quote.js";

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
