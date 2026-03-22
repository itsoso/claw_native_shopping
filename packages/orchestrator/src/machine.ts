import type { ProcurementEvent, ProcurementState, ProcurementStateValue } from "./types.js";

export type ProcurementMachine = {
  initialState: ProcurementState;
  transition(state: ProcurementState, event: ProcurementEvent): ProcurementState;
};

const transitionMap: Record<ProcurementStateValue, Partial<Record<ProcurementEvent["type"], ProcurementStateValue>>> =
  {
    sourcing: {
      APPROVAL_WAIT: "approvalWait",
      QUOTE_COLLECTION: "quoteCollection",
      OFFER_SELECTED: "offerSelected",
      EXCEPTION: "exception"
    },
    approvalWait: {
      SOURCING: "sourcing",
      QUOTE_COLLECTION: "quoteCollection",
      OFFER_SELECTED: "offerSelected",
      EXCEPTION: "exception"
    },
    quoteCollection: {
      OFFER_SELECTED: "offerSelected",
      EXCEPTION: "exception"
    },
    offerSelected: {
      INVENTORY_HELD: "inventoryHeld",
      EXCEPTION: "exception"
    },
    inventoryHeld: {
      PAYMENT_AUTHORIZED: "paymentAuthorized",
      EXCEPTION: "exception"
    },
    paymentAuthorized: {
      ORDER_COMMITTED: "orderCommitted",
      EXCEPTION: "exception"
    },
    orderCommitted: {
      FULFILLMENT_STARTED: "fulfillmentStarted",
      EXCEPTION: "exception"
    },
    fulfillmentStarted: {
      EXCEPTION: "exception"
    },
    exception: {
      RETRY: "retry"
    },
    retry: {
      SOURCING: "sourcing"
    }
  };

export const createProcurementMachine = (): ProcurementMachine => {
  const initialState: ProcurementState = {
    value: "sourcing"
  };

  return {
    initialState,
    transition(state, event) {
      const nextValue = transitionMap[state.value][event.type];
      return nextValue ? { value: nextValue } : state;
    }
  };
};
