import type { InventoryHold, OrderCommit, Quote, RFQ } from "./messages.js";

export type SellerProtocolPort = {
  requestQuote(rfq: RFQ): Promise<Quote>;
  holdInventory(quote: Quote): Promise<InventoryHold>;
  commitOrder(input: {
    rfq: RFQ;
    quote: Quote;
    hold: InventoryHold;
  }): Promise<OrderCommit>;
};
