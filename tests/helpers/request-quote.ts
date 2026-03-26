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
import { rankOffers, type RankedOffer } from "../../packages/offer-evaluator/src/score.js";
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

export const createSellerSimQuoteCollector = (app: FastifyInstance): {
  collectBestQuote(rfq: RFQ): Promise<{
    selectedQuote: Quote;
    rankedOffers: RankedOffer[];
    quotes: Quote[];
  }>;
} => ({
  async collectBestQuote(rfq: RFQ) {
    const response = await app.inject({
      method: "POST",
      url: "/rfq/options",
      payload: rfq
    });

    if (response.statusCode >= 400) {
      throw new Error(`seller sim request failed: ${response.statusCode}`);
    }

    const quotes = (response.json() as unknown[]).map((value) => QuoteSchema.parse(value));
    const rankedOffers = rankOffers(
      quotes.map((quote) => ({
        sellerId: quote.sellerAgentId,
        totalCost:
          quote.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) +
          quote.shippingFee +
          quote.taxFee,
        etaHours:
          typeof quote.serviceTerms["etaHours"] === "number"
            ? quote.serviceTerms["etaHours"]
            : 24,
        trust:
          typeof quote.serviceTerms["trustScore"] === "number"
            ? quote.serviceTerms["trustScore"]
            : 0.5,
        policyMatch:
          typeof quote.serviceTerms["policyMatch"] === "number"
            ? quote.serviceTerms["policyMatch"]
            : 0.5
      }))
    );

    const selected = rankedOffers[0];
    if (!selected) {
      throw new Error("seller sim request failed: no ranked offer returned");
    }

    const selectedQuote = quotes.find((quote) => quote.sellerAgentId === selected.sellerId);
    if (!selectedQuote) {
      throw new Error(`seller sim request failed: quote missing for ${selected.sellerId}`);
    }

    return {
      selectedQuote,
      rankedOffers,
      quotes
    };
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
