import { describe, expect, it } from "vitest";
import { runProcurementScenario } from "../../packages/orchestrator/src/service.js";

describe("procurement service", () => {
  it("runs demand to committed order using mocked ports", async () => {
    const result = await runProcurementScenario();
    expect(result.status).toBe("orderCommitted");
  });

  it("persists ranked-offer metadata on the committed path", async () => {
    const result = await runProcurementScenario({
      requestMetadata: {
        scenarioId: "seller-eta-tradeoff",
        mode: "value",
      },
      quoteCollector: {
        async collectBestQuote(rfq) {
          return {
            selectedQuote: {
              quoteId: `quote_${rfq.rfqId}`,
              rfqId: rfq.rfqId,
              sellerAgentId: "seller_ranked",
              items: [
                {
                  productId: "egg-12",
                  quantity: rfq.quantity,
                  unitPrice: 16,
                },
              ],
              shippingFee: 0,
              taxFee: 0,
              deliveryEta: "2026-03-24T09:00:00+08:00",
              inventoryHoldTtlSec: 900,
              serviceTerms: {
                trustScore: 0.92,
              },
            },
            rankedOffers: [
              {
                sellerId: "seller_ranked",
                score: 0.92,
                totalCost: 16,
                etaHours: 4,
                trust: 0.92,
                policyMatch: 1,
              },
              {
                sellerId: "seller_backup",
                score: 0.54,
                totalCost: 18,
                etaHours: 10,
                trust: 0.6,
                policyMatch: 0.7,
              },
            ],
            quotes: [],
          };
        },
      },
    });

    expect(result.status).toBe("orderCommitted");
    expect(result.snapshot.status).toBe("fulfillmentStarted");
    expect(result.snapshot.selectedScenarioId).toBe("seller-eta-tradeoff");
    expect(result.snapshot.selectedMode).toBe("value");
    expect(result.snapshot.rankedOfferCount).toBe(2);
    expect(result.snapshot.selectedOfferScore).toBe(0.92);
    expect(result.explanation).toContain("REQUEST_PROFILE_APPLIED");
    expect(result.explanation).toContain("OFFERS_RANKED");
    expect(result.explanation).toContain("ORDER_COMMITTED");
  });

  it("returns approvalRequired with policy decision context when auto-approval is exceeded", async () => {
    const result = await runProcurementScenario({
      policyAutoApproveLimit: 10,
      requestMetadata: {
        scenarioId: "replenish-laundry",
        mode: "safe",
      },
    });

    expect(result.status).toBe("approvalRequired");
    if (result.status !== "approvalRequired") {
      throw new Error(`expected approvalRequired, received ${result.status}`);
    }
    expect(result.reason).toBe("approval_required");
    expect(result.snapshot.status).toBe("approvalWait");
    expect(result.snapshot.policyDecision).toBe("approval_required");
    expect(result.snapshot.selectedScenarioId).toBe("replenish-laundry");
    expect(result.snapshot.selectedMode).toBe("safe");
    expect(result.explanation).toContain("APPROVAL_REQUIRED");
  });

  it("returns retry with quote and snapshot context when inventory hold fails", async () => {
    const result = await runProcurementScenario({
      inventoryHoldShouldFail: true,
      requestMetadata: {
        scenarioId: "optimize-cart-threshold",
        mode: "time_saving",
      },
    });

    expect(result.status).toBe("retry");
    if (result.status !== "retry") {
      throw new Error(`expected retry, received ${result.status}`);
    }
    expect(result.reason).toBe("inventory_hold_failed");
    expect(result.snapshot.status).toBe("retry");
    expect(result.snapshot.quoteId).toMatch(/^quote_/);
    expect(result.snapshot.selectedScenarioId).toBe("optimize-cart-threshold");
    expect(result.snapshot.selectedMode).toBe("time_saving");
    expect(result.explanation).toContain("INVENTORY_HOLD_FAILED");
  });
});
