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
import { createSellerHttpClient } from "./httpClient.js";

export type SellerHttpPortOptions = {
  baseUrl: string;
  fetch?: typeof fetch;
};

export const createSellerHttpPort = (
  options: SellerHttpPortOptions,
): SellerProtocolPort => {
  const client = createSellerHttpClient(options);

  return {
    async requestQuote(rfq: RFQ): Promise<Quote> {
      return client.postJson(
        "/rfq",
        rfq,
        "seller request failed: POST /rfq",
        QuoteSchema.parse,
      );
    },

    async holdInventory(quote: Quote): Promise<InventoryHold> {
      return client.postJson(
        `/quotes/${quote.quoteId}/hold`,
        undefined,
        `seller request failed: POST /quotes/${quote.quoteId}/hold`,
        InventoryHoldSchema.parse,
      );
    },

    async commitOrder(input: {
      rfq: RFQ;
      quote: Quote;
      hold: InventoryHold;
    }): Promise<OrderCommit> {
      return client.postJson(
        "/orders/commit",
        input,
        "seller request failed: POST /orders/commit",
        OrderCommitSchema.parse,
      );
    },
  };
};
