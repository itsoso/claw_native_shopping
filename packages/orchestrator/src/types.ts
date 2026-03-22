export type ProcurementStateValue =
  | "sourcing"
  | "approvalWait"
  | "quoteCollection"
  | "offerSelected"
  | "inventoryHeld"
  | "paymentAuthorized"
  | "orderCommitted"
  | "fulfillmentStarted"
  | "exception"
  | "retry";

export type ProcurementState = {
  value: ProcurementStateValue;
};

export type ProcurementEvent =
  | { type: "SOURCING" }
  | { type: "APPROVAL_WAIT" }
  | { type: "QUOTE_COLLECTION" }
  | { type: "OFFER_SELECTED" }
  | { type: "INVENTORY_HELD" }
  | { type: "PAYMENT_AUTHORIZED" }
  | { type: "ORDER_COMMITTED" }
  | { type: "FULFILLMENT_STARTED" }
  | { type: "EXCEPTION" }
  | { type: "RETRY" };
