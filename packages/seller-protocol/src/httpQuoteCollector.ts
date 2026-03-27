import { rankOffers, type RankedOffer } from "../../../packages/offer-evaluator/src/score.js";
import { QuoteSchema, type Quote, type RFQ } from "./messages.js";
import { createSellerHttpClient } from "./httpClient.js";

export type SellerHttpQuoteCollectorOptions = {
  baseUrl: string;
  fetch?: typeof fetch;
};

export type RankedQuoteCollection = {
  selectedQuote: Quote;
  rankedOffers: RankedOffer[];
  quotes: Quote[];
};

const asNumber = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

export const createSellerHttpQuoteCollector = (
  options: SellerHttpQuoteCollectorOptions,
): {
  collectBestQuote(rfq: RFQ): Promise<RankedQuoteCollection>;
} => {
  const client = createSellerHttpClient(options);

  return {
    async collectBestQuote(rfq: RFQ): Promise<RankedQuoteCollection> {
      const quotes = await client.postJson(
        "/rfq/options",
        rfq,
        "seller request failed: POST /rfq/options",
        (value) => (value as unknown[]).map((entry) => QuoteSchema.parse(entry)),
      );
      const quoteBySeller = new Map(quotes.map((quote) => [quote.sellerAgentId, quote]));

      const rankedOffers = rankOffers(
        quotes.map((quote) => ({
          sellerId: quote.sellerAgentId,
          totalCost:
            quote.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) +
            quote.shippingFee +
            quote.taxFee,
          etaHours: asNumber(quote.serviceTerms["etaHours"], 24),
          trust: asNumber(quote.serviceTerms["trustScore"], 0.5),
          policyMatch: asNumber(quote.serviceTerms["policyMatch"], 0.5),
        })),
      );

      const bestOffer = rankedOffers[0];
      if (!bestOffer) {
        throw new Error("seller request failed: POST /rfq/options returned no quotes");
      }

      const selectedQuote = quoteBySeller.get(bestOffer.sellerId);
      if (!selectedQuote) {
        throw new Error(`seller request failed: ranked seller ${bestOffer.sellerId} had no quote`);
      }

      return {
        selectedQuote,
        rankedOffers,
        quotes,
      };
    },
  };
};
