import type { FastifyInstance } from "fastify";
import { RFQSchema, QuoteSchema } from "../../../packages/seller-protocol/src/messages.js";
import { sellerCatalog } from "./data.js";

const createQuoteId = (rfqId: string): string => `quote_${rfqId}`;
const createHoldId = (quoteId: string): string => `hold_${quoteId}`;

export const registerSellerSimHandlers = (app: FastifyInstance): void => {
  const quotes = new Map<string, { rfqId: string; sellerAgentId: string }>();

  app.post("/rfq", async (request, reply) => {
    const rfq = RFQSchema.parse(request.body);
    const item = sellerCatalog.find((entry) => entry.category === rfq.category);

    if (!item) {
      return reply.code(404).send({ error: "category_not_supported" });
    }

    const quote = QuoteSchema.parse({
      quoteId: createQuoteId(rfq.rfqId),
      rfqId: rfq.rfqId,
      sellerAgentId: "seller_1",
      items: [
        {
          productId: item.productId,
          quantity: rfq.quantity,
          unitPrice: item.unitPrice
        }
      ],
      shippingFee: 0,
      taxFee: 0,
      deliveryEta: "2026-03-24T09:00:00+08:00",
      inventoryHoldTtlSec: 900,
      serviceTerms: {}
    });

    quotes.set(quote.quoteId, {
      rfqId: quote.rfqId,
      sellerAgentId: quote.sellerAgentId
    });

    return reply.send(quote);
  });

  app.post("/quotes/:quoteId/hold", async (request, reply) => {
    const quoteId = (request.params as { quoteId: string }).quoteId;
    const quote = quotes.get(quoteId);

    if (!quote) {
      return reply.code(404).send({ error: "quote_not_found" });
    }

    return reply.send({
      holdId: createHoldId(quoteId),
      quoteId,
      rfqId: quote.rfqId,
      sellerAgentId: quote.sellerAgentId,
      expiresAt: "2026-03-24T09:15:00+08:00"
    });
  });
};
