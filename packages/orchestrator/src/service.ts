import { createMemoryStore, type MemoryStore, type OrderSnapshot } from "../../../packages/memory/src/store.js";
import { evaluatePolicy } from "../../../packages/policy-engine/src/evaluate.js";
import { planDemand } from "../../../packages/demand-planner/src/plan.js";
import { rankOffers } from "../../../packages/offer-evaluator/src/score.js";
import type { SellerProtocolPort } from "../../../packages/seller-protocol/src/port.js";
import {
  InventoryHoldSchema,
  OrderCommitSchema,
  QuoteSchema,
  RFQSchema
} from "../../../packages/seller-protocol/src/messages.js";
import { executeCheckout } from "../../../packages/checkout/src/execute.js";
import { createProcurementMachine } from "./machine.js";
import {
  getProcurementScenario,
  type ProcurementScenarioDefinition,
  type ProcurementScenarioId
} from "./scenarios.js";

export type ProcurementScenarioFixture = {
  scenarioId?: ProcurementScenarioId;
  inventoryHoldShouldFail?: boolean;
  policyAutoApproveLimit?: number;
  store?: MemoryStore;
  sellerPort?: SellerProtocolPort;
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

const createSellerAdapter = (
  fixture: ProcurementScenarioFixture,
  scenario: ProcurementScenarioDefinition
): SellerProtocolPort => {
  return {
    async requestQuote(rfq) {
      const rankedOffers = rankOffers(scenario.offers);

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
            productId: scenario.offerProductId,
            quantity: rfq.quantity,
            unitPrice: bestOffer.totalCost
          }
        ],
        shippingFee: 0,
        taxFee: 0,
        deliveryEta: scenario.offerDeliveryEta,
        inventoryHoldTtlSec: 900,
        serviceTerms: { trustScore: bestOffer.trust }
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
        expiresAt: "2026-03-24T09:15:00+08:00"
      });
    },
    async commitOrder(input) {
      return OrderCommitSchema.parse({
        orderId: `order_${input.rfq.rfqId}`,
        rfqId: input.rfq.rfqId,
        quoteId: input.quote.quoteId,
        sellerAgentId: input.quote.sellerAgentId,
        committedAt: "2026-03-23T12:10:00+08:00"
      });
    }
  };
};

export const runProcurementScenario = async (
  fixture: ProcurementScenarioFixture = {}
): Promise<ProcurementScenarioResult> => {
  const store = fixture.store ?? createMemoryStore();
  const machine = createProcurementMachine();
  const scenario = getProcurementScenario(fixture.scenarioId ?? "home");
  const seller: SellerProtocolPort = fixture.sellerPort
    ? {
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
        }
      }
    : createSellerAdapter({
        ...(fixture.inventoryHoldShouldFail === undefined
          ? {}
          : { inventoryHoldShouldFail: fixture.inventoryHoldShouldFail })
      }, scenario);

  let state = machine.initialState;
  state = machine.transition(state, { type: "QUOTE_COLLECTION" });

  const [intent] = planDemand({
    inventory: scenario.inventory,
    catalogMap: scenario.catalogMap,
    planningDefaults: scenario.planningDefaults
  });

  if (!intent) {
    throw new Error("no_demand_intent");
  }

  const orderId = `order_${intent.id}`;

  const rfq = RFQSchema.parse({
    rfqId: intent.id,
    buyerAgentId: scenario.buyerAgentId,
    category: intent.category,
    quantity: intent.quantity
  });

  store.appendAuditEvent(orderId, {
    type: "INTENT_CREATED",
    category: intent.category,
    quantity: intent.quantity
  });

  const quote = await seller.requestQuote(rfq);
  state = machine.transition(state, { type: "OFFER_SELECTED" });

  const quoteTotal = quote.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  ) + quote.shippingFee + quote.taxFee;

  store.appendAuditEvent(orderId, {
    type: "QUOTE_SELECTED",
    sellerId: quote.sellerAgentId,
    quoteId: quote.quoteId,
    totalAmount: quoteTotal
  });

  const policyEvaluation = evaluatePolicy(
    {
      autoApproveLimit: fixture.policyAutoApproveLimit ?? scenario.defaultAutoApproveLimit,
      blockedSellers: [],
      requiredCertifications: []
    },
    {
      totalAmount: quoteTotal,
      sellerId: quote.sellerAgentId,
      certifications: []
    }
  );

  store.appendAuditEvent(orderId, {
    type: "POLICY_EVALUATED",
    decision: policyEvaluation.decision,
    reasons: policyEvaluation.reasons,
    totalAmount: quoteTotal,
    sellerId: quote.sellerAgentId
  });

  if (policyEvaluation.decision === "rejected") {
    const snapshot: OrderSnapshot = {
      orderId,
      status: "policyRejected",
      scenarioId: scenario.scenarioId,
      scenarioLabel: scenario.label,
      category: intent.category,
      requestedQuantity: intent.quantity,
      rfqId: rfq.rfqId,
      quoteId: quote.quoteId,
      sellerAgentId: quote.sellerAgentId,
      decision: policyEvaluation.decision
    };
    store.setOrderSnapshot(snapshot);

    return {
      status: "retry",
      reason: "policy_rejected",
      explanation: store.getAuditEvents(orderId).map((event) => event.type),
      snapshot
    };
  }

  if (policyEvaluation.requiresApproval) {
    state = machine.transition(state, { type: "APPROVAL_WAIT" });
    store.appendAuditEvent(orderId, {
      type: "APPROVAL_REQUIRED",
      decision: policyEvaluation.decision,
      reasons: policyEvaluation.reasons,
      totalAmount: quoteTotal,
      sellerId: quote.sellerAgentId
    });
    const snapshot: OrderSnapshot = {
      orderId,
      status: "approvalWait",
      scenarioId: scenario.scenarioId,
      scenarioLabel: scenario.label,
      category: intent.category,
      requestedQuantity: intent.quantity,
      rfqId: rfq.rfqId,
      quoteId: quote.quoteId,
      sellerAgentId: quote.sellerAgentId,
      totalAmount: quoteTotal,
      policyDecision: policyEvaluation.decision
    };
    store.setOrderSnapshot(snapshot);

    return {
      status: "approvalRequired",
      orderId,
      reason: "approval_required",
      explanation: store.getAuditEvents(orderId).map((event) => event.type),
      snapshot
    };
  }

  let hold;
  try {
    hold = await seller.holdInventory(quote);
    state = machine.transition(state, { type: "INVENTORY_HELD" });
    store.appendAuditEvent(orderId, {
      type: "INVENTORY_HELD",
      holdId: hold.holdId,
      sellerId: quote.sellerAgentId
    });
  } catch {
    state = machine.transition(state, { type: "EXCEPTION" });
    state = machine.transition(state, { type: "RETRY" });
    store.appendAuditEvent(orderId, { type: "INVENTORY_HOLD_FAILED" });
    const snapshot: OrderSnapshot = {
      orderId,
      status: state.value,
      scenarioId: scenario.scenarioId,
      scenarioLabel: scenario.label,
      category: intent.category,
      requestedQuantity: intent.quantity,
      rfqId: rfq.rfqId,
      quoteId: quote.quoteId
    };
    store.setOrderSnapshot(snapshot);

    return {
      status: "retry",
      reason: "inventory_hold_failed",
      explanation: store.getAuditEvents(orderId).map((event) => event.type),
      snapshot
    };
  }

  const checkoutResult = await executeCheckout({
    holdConfirmed: true,
    payment: {
      async authorize() {
        return { approved: true };
      }
    },
    seller: {
      async commitOrder() {
        return seller.commitOrder({ rfq, quote, hold });
      }
    }
  });

  store.appendAuditEvent(orderId, { type: "PAYMENT_AUTHORIZED" });
  state = machine.transition(state, { type: "PAYMENT_AUTHORIZED" });
  state = machine.transition(state, { type: "ORDER_COMMITTED" });
  state = machine.transition(state, { type: "FULFILLMENT_STARTED" });

  store.appendAuditEvent(orderId, {
    type: "ORDER_COMMITTED",
    orderId: checkoutResult.orderId
  });
  const snapshot: OrderSnapshot = {
    orderId: checkoutResult.orderId,
    status: state.value,
    scenarioId: scenario.scenarioId,
    scenarioLabel: scenario.label,
    category: intent.category,
    requestedQuantity: intent.quantity,
    rfqId: rfq.rfqId,
    quoteId: quote.quoteId,
    holdId: hold.holdId,
    sellerAgentId: quote.sellerAgentId,
    totalAmount: quoteTotal,
    policyDecision: policyEvaluation.decision
  };
  store.setOrderSnapshot(snapshot);

  return {
    status: "orderCommitted",
    orderId: checkoutResult.orderId,
    explanation: store.getAuditEvents(orderId).map((event) => event.type),
    snapshot
  };
};
