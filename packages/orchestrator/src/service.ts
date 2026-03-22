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

type ProcurementScenarioResult = {
  status: "orderCommitted";
  orderId: string;
};

const createSellerAdapter = (): SellerProtocolPort => {
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

export const runProcurementScenario = async (): Promise<ProcurementScenarioResult> => {
  const store = createMemoryStore();
  const machine = createProcurementMachine();
  const seller = createSellerAdapter();

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

  const hold = await seller.holdInventory(quote);
  state = machine.transition(state, { type: "INVENTORY_HELD" });

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
    orderId: checkoutResult.orderId
  };
};
