import {
  createMemoryStore,
  type MemoryStore,
  type OrderSnapshot,
} from "../../../packages/memory/src/store.js";
import { evaluatePolicy } from "../../../packages/policy-engine/src/evaluate.js";
import { planDemand } from "../../../packages/demand-planner/src/plan.js";
import type { DemandPlannerInput } from "../../../packages/demand-planner/src/types.js";
import { rankOffers, type RankedOffer } from "../../../packages/offer-evaluator/src/score.js";
import type { SellerProtocolPort } from "../../../packages/seller-protocol/src/port.js";
import {
  InventoryHoldSchema,
  OrderCommitSchema,
  QuoteSchema,
  RFQSchema,
  type InventoryHold,
  type Quote,
  type RFQ,
} from "../../../packages/seller-protocol/src/messages.js";
import { executeCheckout } from "../../../packages/checkout/src/execute.js";
import { createProcurementMachine } from "./machine.js";

export type SellerQuoteCollector = {
  collectBestQuote(rfq: RFQ): Promise<{
    selectedQuote: Quote;
    rankedOffers: RankedOffer[];
    quotes: Quote[];
  }>;
};

export type ProcurementScenarioFixture = {
  inventoryHoldShouldFail?: boolean;
  policyAutoApproveLimit?: number;
  planningInput?: DemandPlannerInput;
  requestMetadata?: {
    scenarioId?: string;
    mode?: string;
  };
  store?: MemoryStore;
  sellerPort?: SellerProtocolPort;
  quoteCollector?: SellerQuoteCollector;
};

export type ProcurementScenarioResult =
  | {
      status: "orderCommitted";
      orderId: string;
      explanation: string[];
      snapshot: OrderSnapshot;
    }
  | {
      status: "approvalRequired";
      orderId: string;
      reason: "approval_required";
      explanation: string[];
      snapshot: OrderSnapshot;
    }
  | {
      status: "retry";
      reason: string;
      explanation: string[];
      snapshot: OrderSnapshot;
    };

type SnapshotContext = {
  selectedScenarioId?: string;
  selectedMode?: string;
  requestedCategory: string;
  requestedQuantity: number;
  budgetLimit: number;
  deliveryWindowLatestAt: string;
};

type QuoteSelectionContext = {
  rankedOfferCount?: number;
  selectedOfferScore?: number;
  selectedSellerId?: string;
};

const createDefaultPlanningInput = (): DemandPlannerInput => ({
  inventory: [{ sku: "egg-12", quantityOnHand: 2, reorderPoint: 4 }],
  catalogMap: {
    "egg-12": { category: "eggs", normalizedAttributes: { count: 12 } },
  },
  planningDefaults: {
    deliveryWindowLatestAt: "2026-03-24T09:00:00+08:00",
    budgetLimit: 40,
  },
});

const createFallbackSellerPort = (
  fixture: ProcurementScenarioFixture,
): SellerProtocolPort => ({
  async requestQuote(rfq) {
    const rankedOffers = rankOffers([
      { sellerId: "seller_1", totalCost: 20, etaHours: 4, trust: 0.9, policyMatch: 1 },
      { sellerId: "seller_2", totalCost: 18, etaHours: 20, trust: 0.4, policyMatch: 0.7 },
    ]);

    const bestOffer = rankedOffers[0];
    if (!bestOffer) {
      throw new Error("no_offers_available");
    }

    return QuoteSchema.parse({
      quoteId: `quote_${rfq.rfqId}`,
      rfqId: rfq.rfqId,
      sellerAgentId: bestOffer.sellerId,
      items: [
        {
          productId: "egg-12",
          quantity: rfq.quantity,
          unitPrice: bestOffer.totalCost,
        },
      ],
      shippingFee: 0,
      taxFee: 0,
      deliveryEta: "2026-03-24T09:00:00+08:00",
      inventoryHoldTtlSec: 900,
      serviceTerms: { trustScore: bestOffer.trust },
    });
  },

  async holdInventory(quote) {
    if (fixture.inventoryHoldShouldFail) {
      throw new Error("inventory_hold_failed");
    }

    return InventoryHoldSchema.parse({
      holdId: `hold_${quote.quoteId}`,
      rfqId: quote.rfqId,
      quoteId: quote.quoteId,
      sellerAgentId: quote.sellerAgentId,
      expiresAt: "2026-03-24T09:15:00+08:00",
    });
  },

  async commitOrder(input) {
    return OrderCommitSchema.parse({
      orderId: `order_${input.rfq.rfqId}`,
      rfqId: input.rfq.rfqId,
      quoteId: input.quote.quoteId,
      sellerAgentId: input.quote.sellerAgentId,
      committedAt: "2026-03-23T12:10:00+08:00",
    });
  },
});

const resolveSellerPort = (
  fixture: ProcurementScenarioFixture,
): SellerProtocolPort => {
  if (!fixture.sellerPort) {
    return createFallbackSellerPort(fixture);
  }

  return {
    async requestQuote(rfq) {
      return fixture.sellerPort!.requestQuote(rfq);
    },

    async holdInventory(quote) {
      if (fixture.inventoryHoldShouldFail) {
        throw new Error("inventory_hold_failed");
      }

      return fixture.sellerPort!.holdInventory(quote);
    },

    async commitOrder(input) {
      return fixture.sellerPort!.commitOrder(input);
    },
  };
};

const resolvePlanningInput = (fixture: ProcurementScenarioFixture): DemandPlannerInput =>
  fixture.planningInput ?? createDefaultPlanningInput();

const getExplanation = (store: MemoryStore, orderId: string): string[] =>
  store.getAuditEvents(orderId).map((event) => event.type);

const buildSnapshotContext = (
  fixture: ProcurementScenarioFixture,
  intent: {
    category: string;
    quantity: number;
    budgetLimit: number;
    deliveryWindow: { latestAt: string };
  },
): SnapshotContext => ({
  ...(fixture.requestMetadata?.scenarioId
    ? { selectedScenarioId: fixture.requestMetadata.scenarioId }
    : {}),
  ...(fixture.requestMetadata?.mode
    ? { selectedMode: fixture.requestMetadata.mode }
    : {}),
  requestedCategory: intent.category,
  requestedQuantity: intent.quantity,
  budgetLimit: intent.budgetLimit,
  deliveryWindowLatestAt: intent.deliveryWindow.latestAt,
});

const appendRequestProfileAudit = (
  store: MemoryStore,
  orderId: string,
  fixture: ProcurementScenarioFixture,
  snapshotContext: SnapshotContext,
): void => {
  if (fixture.requestMetadata?.scenarioId || fixture.requestMetadata?.mode) {
    store.appendAuditEvent(orderId, {
      type: "REQUEST_PROFILE_APPLIED",
      ...snapshotContext,
    });
  }
};

const calculateQuoteTotal = (quote: Quote): number =>
  quote.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) +
  quote.shippingFee +
  quote.taxFee;

const buildQuoteSelectionContext = (
  quoteSelection:
    | Awaited<ReturnType<SellerQuoteCollector["collectBestQuote"]>>
    | null,
  selectedQuote: Quote,
): QuoteSelectionContext => {
  if (!quoteSelection) {
    return {};
  }

  const selectedOffer = quoteSelection.rankedOffers.find(
    (offer) => offer.sellerId === selectedQuote.sellerAgentId,
  );

  return {
    rankedOfferCount: quoteSelection.rankedOffers.length,
    ...(selectedOffer ? { selectedOfferScore: selectedOffer.score } : {}),
    selectedSellerId: selectedQuote.sellerAgentId,
  };
};

const selectQuote = async ({
  fixture,
  seller,
  store,
  orderId,
  rfq,
}: {
  fixture: ProcurementScenarioFixture;
  seller: SellerProtocolPort;
  store: MemoryStore;
  orderId: string;
  rfq: RFQ;
}): Promise<{
  quote: Quote;
  quoteTotal: number;
  quoteSelectionContext: QuoteSelectionContext;
}> => {
  const quoteSelection = fixture.quoteCollector
    ? await fixture.quoteCollector.collectBestQuote(rfq)
    : null;
  const quote = quoteSelection?.selectedQuote ?? (await seller.requestQuote(rfq));
  const quoteSelectionContext = buildQuoteSelectionContext(quoteSelection, quote);

  if (quoteSelection) {
    store.appendAuditEvent(orderId, {
      type: "OFFERS_RANKED",
      ...quoteSelectionContext,
    });
  }

  const quoteTotal = calculateQuoteTotal(quote);
  store.appendAuditEvent(orderId, {
    type: "QUOTE_SELECTED",
    sellerId: quote.sellerAgentId,
    quoteId: quote.quoteId,
    totalAmount: quoteTotal,
  });

  return {
    quote,
    quoteTotal,
    quoteSelectionContext,
  };
};

const buildPolicyRejectedResult = ({
  store,
  orderId,
  rfq,
  quote,
  quoteSelectionContext,
  snapshotContext,
  decision,
}: {
  store: MemoryStore;
  orderId: string;
  rfq: RFQ;
  quote: Quote;
  quoteSelectionContext: QuoteSelectionContext;
  snapshotContext: SnapshotContext;
  decision: string;
}): ProcurementScenarioResult => {
  const snapshot: OrderSnapshot = {
    orderId,
    status: "policyRejected",
    rfqId: rfq.rfqId,
    quoteId: quote.quoteId,
    sellerAgentId: quote.sellerAgentId,
    decision,
    ...quoteSelectionContext,
    ...snapshotContext,
  };
  store.setOrderSnapshot(snapshot);

  return {
    status: "retry",
    reason: "policy_rejected",
    explanation: getExplanation(store, orderId),
    snapshot,
  };
};

const buildApprovalRequiredResult = ({
  store,
  orderId,
  rfq,
  quote,
  quoteTotal,
  quoteSelectionContext,
  snapshotContext,
  policyDecision,
}: {
  store: MemoryStore;
  orderId: string;
  rfq: RFQ;
  quote: Quote;
  quoteTotal: number;
  quoteSelectionContext: QuoteSelectionContext;
  snapshotContext: SnapshotContext;
  policyDecision: string;
}): ProcurementScenarioResult => {
  const snapshot: OrderSnapshot = {
    orderId,
    status: "approvalWait",
    rfqId: rfq.rfqId,
    quoteId: quote.quoteId,
    sellerAgentId: quote.sellerAgentId,
    totalAmount: quoteTotal,
    deliveryEta: quote.deliveryEta,
    policyDecision,
    ...quoteSelectionContext,
    ...snapshotContext,
  };
  store.setOrderSnapshot(snapshot);

  return {
    status: "approvalRequired",
    orderId,
    reason: "approval_required",
    explanation: getExplanation(store, orderId),
    snapshot,
  };
};

const buildInventoryRetryResult = ({
  store,
  orderId,
  status,
  rfq,
  quote,
  quoteSelectionContext,
  snapshotContext,
}: {
  store: MemoryStore;
  orderId: string;
  status: string;
  rfq: RFQ;
  quote: Quote;
  quoteSelectionContext: QuoteSelectionContext;
  snapshotContext: SnapshotContext;
}): ProcurementScenarioResult => {
  const snapshot: OrderSnapshot = {
    orderId,
    status,
    rfqId: rfq.rfqId,
    quoteId: quote.quoteId,
    sellerAgentId: quote.sellerAgentId,
    totalAmount: calculateQuoteTotal(quote),
    deliveryEta: quote.deliveryEta,
    ...quoteSelectionContext,
    ...snapshotContext,
  };
  store.setOrderSnapshot(snapshot);

  return {
    status: "retry",
    reason: "inventory_hold_failed",
    explanation: getExplanation(store, orderId),
    snapshot,
  };
};

const buildCommittedResult = ({
  store,
  auditOrderId,
  checkoutOrderId,
  fulfillmentStatus,
  rfq,
  quote,
  hold,
  quoteTotal,
  quoteSelectionContext,
  snapshotContext,
  policyDecision,
}: {
  store: MemoryStore;
  auditOrderId: string;
  checkoutOrderId: string;
  fulfillmentStatus: string;
  rfq: RFQ;
  quote: Quote;
  hold: InventoryHold;
  quoteTotal: number;
  quoteSelectionContext: QuoteSelectionContext;
  snapshotContext: SnapshotContext;
  policyDecision: string;
}): ProcurementScenarioResult => {
  const snapshot: OrderSnapshot = {
    orderId: checkoutOrderId,
    status: fulfillmentStatus,
    rfqId: rfq.rfqId,
    quoteId: quote.quoteId,
    holdId: hold.holdId,
    sellerAgentId: quote.sellerAgentId,
    totalAmount: quoteTotal,
    deliveryEta: quote.deliveryEta,
    policyDecision,
    ...quoteSelectionContext,
    ...snapshotContext,
  };
  store.setOrderSnapshot(snapshot);

  return {
    status: "orderCommitted",
    orderId: checkoutOrderId,
    explanation: getExplanation(store, auditOrderId),
    snapshot,
  };
};

export const runProcurementScenario = async (
  fixture: ProcurementScenarioFixture = {},
): Promise<ProcurementScenarioResult> => {
  const store = fixture.store ?? createMemoryStore();
  const seller = resolveSellerPort(fixture);
  const machine = createProcurementMachine();

  let state = machine.initialState;
  state = machine.transition(state, { type: "QUOTE_COLLECTION" });

  const planningInput = resolvePlanningInput(fixture);
  const [intent] = planDemand(planningInput);
  if (!intent) {
    throw new Error("no_demand_intent");
  }

  const auditOrderId = `order_${intent.id}`;
  const snapshotContext = buildSnapshotContext(fixture, intent);
  appendRequestProfileAudit(store, auditOrderId, fixture, snapshotContext);

  const rfq = RFQSchema.parse({
    rfqId: intent.id,
    buyerAgentId: "buyer_1",
    category: intent.category,
    quantity: intent.quantity,
  });

  store.appendAuditEvent(auditOrderId, {
    type: "INTENT_CREATED",
    category: intent.category,
    quantity: intent.quantity,
  });

  const { quote, quoteTotal, quoteSelectionContext } = await selectQuote({
    fixture,
    seller,
    store,
    orderId: auditOrderId,
    rfq,
  });
  state = machine.transition(state, { type: "OFFER_SELECTED" });

  const policyEvaluation = evaluatePolicy(
    {
      autoApproveLimit: fixture.policyAutoApproveLimit ?? 50,
      blockedSellers: [],
      requiredCertifications: [],
    },
    {
      totalAmount: quoteTotal,
      sellerId: quote.sellerAgentId,
      certifications: [],
    },
  );

  store.appendAuditEvent(auditOrderId, {
    type: "POLICY_EVALUATED",
    decision: policyEvaluation.decision,
    reasons: policyEvaluation.reasons,
    totalAmount: quoteTotal,
    sellerId: quote.sellerAgentId,
  });

  if (policyEvaluation.decision === "rejected") {
    return buildPolicyRejectedResult({
      store,
      orderId: auditOrderId,
      rfq,
      quote,
      quoteSelectionContext,
      snapshotContext,
      decision: policyEvaluation.decision,
    });
  }

  if (policyEvaluation.requiresApproval) {
    state = machine.transition(state, { type: "APPROVAL_WAIT" });
    store.appendAuditEvent(auditOrderId, {
      type: "APPROVAL_REQUIRED",
      decision: policyEvaluation.decision,
      reasons: policyEvaluation.reasons,
      totalAmount: quoteTotal,
      sellerId: quote.sellerAgentId,
    });

    return buildApprovalRequiredResult({
      store,
      orderId: auditOrderId,
      rfq,
      quote,
      quoteTotal,
      quoteSelectionContext,
      snapshotContext,
      policyDecision: policyEvaluation.decision,
    });
  }

  let hold: InventoryHold;
  try {
    hold = await seller.holdInventory(quote);
    state = machine.transition(state, { type: "INVENTORY_HELD" });
    store.appendAuditEvent(auditOrderId, {
      type: "INVENTORY_HELD",
      holdId: hold.holdId,
      sellerId: quote.sellerAgentId,
    });
  } catch {
    state = machine.transition(state, { type: "EXCEPTION" });
    state = machine.transition(state, { type: "RETRY" });
    store.appendAuditEvent(auditOrderId, { type: "INVENTORY_HOLD_FAILED" });

    return buildInventoryRetryResult({
      store,
      orderId: auditOrderId,
      status: state.value,
      rfq,
      quote,
      quoteSelectionContext,
      snapshotContext,
    });
  }

  const checkoutResult = await executeCheckout({
    holdConfirmed: true,
    payment: {
      async authorize() {
        return { approved: true };
      },
    },
    seller: {
      async commitOrder() {
        return seller.commitOrder({ rfq, quote, hold });
      },
    },
  });

  store.appendAuditEvent(auditOrderId, { type: "PAYMENT_AUTHORIZED" });
  state = machine.transition(state, { type: "PAYMENT_AUTHORIZED" });
  state = machine.transition(state, { type: "ORDER_COMMITTED" });
  state = machine.transition(state, { type: "FULFILLMENT_STARTED" });

  store.appendAuditEvent(auditOrderId, {
    type: "ORDER_COMMITTED",
    orderId: checkoutResult.orderId,
  });

  return buildCommittedResult({
    store,
    auditOrderId,
    checkoutOrderId: checkoutResult.orderId,
    fulfillmentStatus: state.value,
    rfq,
    quote,
    hold,
    quoteTotal,
    quoteSelectionContext,
    snapshotContext,
    policyDecision: policyEvaluation.decision,
  });
};
