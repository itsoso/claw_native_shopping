import type { FastifyInstance } from "fastify";
import {
  InventoryHoldSchema,
  OrderCommitSchema,
  RFQSchema,
  QuoteSchema
} from "../../../packages/seller-protocol/src/messages.js";
import { sellerCatalog } from "./data.js";

const createQuoteId = (rfqId: string, sellerAgentId: string): string =>
  `quote_${rfqId}_${sellerAgentId}`;
const createHoldId = (quoteId: string): string => `hold_${quoteId}`;

const buildQuote = (
  rfq: { rfqId: string; quantity: number },
  entry: (typeof sellerCatalog)[number],
) =>
  QuoteSchema.parse({
    quoteId: createQuoteId(rfq.rfqId, entry.sellerAgentId),
    rfqId: rfq.rfqId,
    sellerAgentId: entry.sellerAgentId,
    items: [
      {
        productId: entry.productId,
        quantity: rfq.quantity,
        unitPrice: entry.unitPrice
      }
    ],
    shippingFee: entry.shippingFee,
    taxFee: 0,
    deliveryEta: entry.deliveryEta,
    inventoryHoldTtlSec: 900,
    serviceTerms: {
      etaHours: entry.etaHours,
      trustScore: entry.trustScore,
      policyMatch: entry.policyMatch
    }
  });

export const registerSellerSimHandlers = (app: FastifyInstance): void => {
  const quotes = new Map<string, { rfqId: string; sellerAgentId: string }>();
  const holds = new Map<string, { quoteId: string; rfqId: string; sellerAgentId: string }>();

  app.get("/health", async () => {
    return {
      status: "ok",
      service: "seller-sim"
    };
  });

  app.post("/rfq", async (request, reply) => {
    const rfq = RFQSchema.parse(request.body);
    const options = sellerCatalog.filter((entry) => entry.category === rfq.category);

    if (options.length === 0) {
      return reply.code(404).send({ error: "category_not_supported" });
    }

    const quote = buildQuote(rfq, options[0]!);

    quotes.set(quote.quoteId, {
      rfqId: quote.rfqId,
      sellerAgentId: quote.sellerAgentId
    });

    return reply.send(quote);
  });

  app.post("/rfq/options", async (request, reply) => {
    const rfq = RFQSchema.parse(request.body);
    const options = sellerCatalog.filter((entry) => entry.category === rfq.category);

    if (options.length === 0) {
      return reply.code(404).send({ error: "category_not_supported" });
    }

    const quotesPayload = options.map((entry) => buildQuote(rfq, entry));

    for (const quote of quotesPayload) {
      quotes.set(quote.quoteId, {
        rfqId: quote.rfqId,
        sellerAgentId: quote.sellerAgentId
      });
    }

    return reply.send(quotesPayload);
  });

  app.post("/quotes/:quoteId/hold", async (request, reply) => {
    const quoteId = (request.params as { quoteId: string }).quoteId;
    const quote = quotes.get(quoteId);

    if (!quote) {
      return reply.code(404).send({ error: "quote_not_found" });
    }

    const hold = InventoryHoldSchema.parse({
      holdId: createHoldId(quoteId),
      quoteId,
      rfqId: quote.rfqId,
      sellerAgentId: quote.sellerAgentId,
      expiresAt: "2026-03-24T09:15:00+08:00"
    });

    holds.set(hold.holdId, {
      quoteId: hold.quoteId,
      rfqId: hold.rfqId,
      sellerAgentId: hold.sellerAgentId
    });

    return reply.send(hold);
  });

  app.post("/orders/commit", async (request, reply) => {
    const body = request.body as {
      rfq: { rfqId: string };
      quote: { quoteId: string; sellerAgentId: string; rfqId: string };
      hold: { holdId: string; quoteId: string; rfqId: string; sellerAgentId: string };
    };

    const quote = quotes.get(body.quote.quoteId);
    const hold = holds.get(body.hold.holdId);

    if (!quote || !hold || quote.rfqId !== body.rfq.rfqId || hold.quoteId !== body.quote.quoteId) {
      return reply.code(404).send({ error: "commit_context_not_found" });
    }

    return reply.send(
      OrderCommitSchema.parse({
        orderId: `order_${body.rfq.rfqId}`,
        rfqId: body.rfq.rfqId,
        quoteId: body.quote.quoteId,
        sellerAgentId: body.quote.sellerAgentId,
        committedAt: "2026-03-23T12:10:00+08:00"
      })
    );
  });
};
