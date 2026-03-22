import { createMemoryStore } from "../../../packages/memory/src/store.js";
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

export type ProcurementScenarioFixture = {
  inventoryHoldShouldFail?: boolean;
};

export type ProcurementScenarioResult =
  | {
      status: "orderCommitted";
      orderId: string;
      explanation: string[];
    }
  | {
      status: "retry";
      reason: string;
      explanation: string[];
    };

const createSellerAdapter = (fixture: ProcurementScenarioFixture): SellerProtocolPort => {
  return {
    async requestQuote(rfq) {
      const rankedOffers = rankOffers([
        { sellerId: "seller_1", totalCost: 34, etaHours: 4, trust: 0.9, policyMatch: 1 },
        { sellerId: "seller_2", totalCost: 30, etaHours: 20, trust: 0.4, policyMatch: 0.7 }
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
            unitPrice: bestOffer.totalCost
          }
        ],
        shippingFee: 0,
        taxFee: 0,
        deliveryEta: "2026-03-24T09:00:00+08:00",
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
  const store = createMemoryStore();
  const machine = createProcurementMachine();
  const seller = createSellerAdapter(fixture);

  let state = machine.initialState;
  state = machine.transition(state, { type: "QUOTE_COLLECTION" });

  const [intent] = planDemand({
    inventory: [{ sku: "egg-12", quantityOnHand: 2, reorderPoint: 4 }],
    catalogMap: {
      "egg-12": { category: "eggs", normalizedAttributes: { count: 12 } }
    },
    planningDefaults: {
      deliveryWindowLatestAt: "2026-03-24T09:00:00+08:00",
      budgetLimit: 40
    }
  });

  if (!intent) {
    throw new Error("no_demand_intent");
  }

  const policyEvaluation = evaluatePolicy(
    { autoApproveLimit: 50, blockedSellers: [], requiredCertifications: [] },
    {
      totalAmount: intent.budgetLimit - 5,
      sellerId: "seller_1",
      certifications: []
    }
  );

  if (policyEvaluation.decision === "rejected") {
    throw new Error("policy_rejected");
  }

  if (policyEvaluation.requiresApproval) {
    state = machine.transition(state, { type: "APPROVAL_WAIT" });
  }

  const rfq = RFQSchema.parse({
    rfqId: intent.id,
    buyerAgentId: "buyer_1",
    category: intent.category,
    quantity: intent.quantity
  });

  const quote = await seller.requestQuote(rfq);
  state = machine.transition(state, { type: "OFFER_SELECTED" });

  let hold;
  try {
    hold = await seller.holdInventory(quote);
    state = machine.transition(state, { type: "INVENTORY_HELD" });
  } catch {
    state = machine.transition(state, { type: "EXCEPTION" });
    state = machine.transition(state, { type: "RETRY" });
    store.appendAuditEvent(intent.id, { type: "INVENTORY_HOLD_FAILED" });
    store.setOrderSnapshot({
      orderId: intent.id,
      status: state.value,
      rfqId: rfq.rfqId,
      quoteId: quote.quoteId
    });

    return {
      status: "retry",
      reason: "inventory_hold_failed",
      explanation: store.getAuditEvents(intent.id).map((event) => event.type)
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

  state = machine.transition(state, { type: "PAYMENT_AUTHORIZED" });
  state = machine.transition(state, { type: "ORDER_COMMITTED" });
  state = machine.transition(state, { type: "FULFILLMENT_STARTED" });

  store.appendAuditEvent(checkoutResult.orderId, { type: "QUOTE_SELECTED" });
  store.appendAuditEvent(checkoutResult.orderId, { type: "ORDER_COMMITTED" });
  store.setOrderSnapshot({
    orderId: checkoutResult.orderId,
    status: state.value,
    rfqId: rfq.rfqId,
    quoteId: quote.quoteId,
    holdId: hold.holdId
  });

  return {
    status: "orderCommitted",
    orderId: checkoutResult.orderId,
    explanation: store.getAuditEvents(checkoutResult.orderId).map((event) => event.type)
  };
};
