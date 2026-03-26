import { rankOffers, type RankedOffer } from "../../../packages/offer-evaluator/src/score.js";
import { QuoteSchema, type Quote, type RFQ } from "./messages.js";

export type SellerHttpQuoteCollectorOptions = {
  baseUrl: string;
  fetch?: typeof fetch;
};

export type RankedQuoteCollection = {
  selectedQuote: Quote;
  rankedOffers: RankedOffer[];
  quotes: Quote[];
};

const buildUrl = (baseUrl: string, path: string): string =>
  new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`).toString();

const asNumber = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

export const createSellerHttpQuoteCollector = (
  options: SellerHttpQuoteCollectorOptions,
): {
  collectBestQuote(rfq: RFQ): Promise<RankedQuoteCollection>;
} => {
  const fetchImpl = options.fetch ?? fetch;

  return {
    async collectBestQuote(rfq: RFQ): Promise<RankedQuoteCollection> {
      const response = await fetchImpl(buildUrl(options.baseUrl, "/rfq/options"), {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(rfq),
      });

      if (!response.ok) {
        throw new Error(`seller request failed: POST /rfq/options returned HTTP ${response.status}`);
      }

      const quotes = (await response.json() as unknown[]).map((value) => QuoteSchema.parse(value));
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
