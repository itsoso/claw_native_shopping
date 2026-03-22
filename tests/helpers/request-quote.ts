import type { FastifyInstance } from "fastify";
import { buildSellerSimServer } from "../../apps/seller-sim/src/server.js";
import {
  InventoryHoldSchema,
  OrderCommitSchema,
  QuoteSchema,
  RFQSchema,
  type InventoryHold,
  type OrderCommit,
  type Quote,
  type RFQ
} from "../../packages/seller-protocol/src/messages.js";
import type { SellerProtocolPort } from "../../packages/seller-protocol/src/port.js";

export const createSellerSimProtocolPort = (app: FastifyInstance): SellerProtocolPort => ({
  async requestQuote(rfq: RFQ): Promise<Quote> {
    const response = await app.inject({
      method: "POST",
      url: "/rfq",
      payload: rfq
    });

    if (response.statusCode >= 400) {
      throw new Error(`seller sim request failed: ${response.statusCode}`);
    }

    return QuoteSchema.parse(response.json());
  },
  async holdInventory(quote: Quote): Promise<InventoryHold> {
    const response = await app.inject({
      method: "POST",
      url: `/quotes/${quote.quoteId}/hold`
    });

    if (response.statusCode >= 400) {
      throw new Error(`seller sim request failed: ${response.statusCode}`);
    }

    return InventoryHoldSchema.parse(response.json());
  },
  async commitOrder(input: {
    rfq: RFQ;
    quote: Quote;
    hold: InventoryHold;
  }): Promise<OrderCommit> {
    const response = await app.inject({
      method: "POST",
      url: "/orders/commit",
      payload: input
    });

    if (response.statusCode >= 400) {
      throw new Error(`seller sim request failed: ${response.statusCode}`);
    }

    return OrderCommitSchema.parse(response.json());
  }
});

export const requestQuote = async (input: { category: string; quantity: number }) => {
  const app = buildSellerSimServer();

  try {
    const port = createSellerSimProtocolPort(app);
    return await port.requestQuote({
      rfqId: "rfq_1",
      buyerAgentId: "buyer_1",
      category: input.category,
      quantity: input.quantity
    });
  } finally {
    await app.close();
  }
};

export const validateRFQ = (input: unknown): RFQ => RFQSchema.parse(input);
