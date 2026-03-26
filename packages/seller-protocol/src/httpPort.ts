import {
  InventoryHoldSchema,
  OrderCommitSchema,
  QuoteSchema,
  type InventoryHold,
  type OrderCommit,
  type Quote,
  type RFQ,
} from "./messages.js";
import type { SellerProtocolPort } from "./port.js";

export type SellerHttpPortOptions = {
  baseUrl: string;
  fetch?: typeof fetch;
};

const buildUrl = (baseUrl: string, path: string): string =>
  new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`).toString();

const parseResponse = async <T>(
  response: Response,
  label: string,
  parse: (value: unknown) => T,
): Promise<T> => {
  if (!response.ok) {
    throw new Error(`${label} returned HTTP ${response.status}`);
  }

  return parse(await response.json());
};

export const createSellerHttpPort = (
  options: SellerHttpPortOptions,
): SellerProtocolPort => {
  const fetchImpl = options.fetch ?? fetch;

  return {
    async requestQuote(rfq: RFQ): Promise<Quote> {
      const response = await fetchImpl(buildUrl(options.baseUrl, "/rfq"), {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(rfq),
      });

      return parseResponse(
        response,
        "seller request failed: POST /rfq",
        QuoteSchema.parse,
      );
    },

    async holdInventory(quote: Quote): Promise<InventoryHold> {
      const response = await fetchImpl(
        buildUrl(options.baseUrl, `/quotes/${quote.quoteId}/hold`),
        {
          method: "POST",
        },
      );

      return parseResponse(
        response,
        `seller request failed: POST /quotes/${quote.quoteId}/hold`,
        InventoryHoldSchema.parse,
      );
    },

    async commitOrder(input: {
      rfq: RFQ;
      quote: Quote;
      hold: InventoryHold;
    }): Promise<OrderCommit> {
      const response = await fetchImpl(buildUrl(options.baseUrl, "/orders/commit"), {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(input),
      });

      return parseResponse(
        response,
        "seller request failed: POST /orders/commit",
        OrderCommitSchema.parse,
      );
    },
  };
};
