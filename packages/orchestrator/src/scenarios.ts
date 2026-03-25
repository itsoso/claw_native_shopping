import type { DemandPlannerInput } from "../../demand-planner/src/types.js";

export type ProcurementScenarioId = "home" | "office";

type RankedOfferFixture = {
  sellerId: string;
  totalCost: number;
  etaHours: number;
  trust: number;
  policyMatch: number;
};

export type ProcurementScenarioDefinition = {
  scenarioId: ProcurementScenarioId;
  label: string;
  buyerAgentId: string;
  inventory: DemandPlannerInput["inventory"];
  catalogMap: DemandPlannerInput["catalogMap"];
  planningDefaults: DemandPlannerInput["planningDefaults"];
  offerProductId: string;
  offerDeliveryEta: string;
  offers: RankedOfferFixture[];
  defaultAutoApproveLimit: number;
};

const SCENARIOS: Record<ProcurementScenarioId, ProcurementScenarioDefinition> = {
  home: {
    scenarioId: "home",
    label: "家庭冰箱补货",
    buyerAgentId: "buyer_home_1",
    inventory: [{ sku: "egg-12", quantityOnHand: 2, reorderPoint: 4 }],
    catalogMap: {
      "egg-12": {
        category: "eggs",
        normalizedAttributes: { count: 12, raisingMethod: "free_range" }
      }
    },
    planningDefaults: {
      deliveryWindowLatestAt: "2026-03-24T09:00:00+08:00",
      budgetLimit: 40
    },
    offerProductId: "egg-12",
    offerDeliveryEta: "2026-03-24T09:00:00+08:00",
    offers: [
      { sellerId: "farmhouse_hub", totalCost: 10, etaHours: 4, trust: 0.94, policyMatch: 1 },
      { sellerId: "rush_grocery", totalCost: 12, etaHours: 2, trust: 0.72, policyMatch: 0.82 }
    ],
    defaultAutoApproveLimit: 50
  },
  office: {
    scenarioId: "office",
    label: "办公室 / 门店补货",
    buyerAgentId: "buyer_ops_1",
    inventory: [{ sku: "coffee-1kg", quantityOnHand: 1, reorderPoint: 4 }],
    catalogMap: {
      "coffee-1kg": {
        category: "coffee",
        normalizedAttributes: { weightKg: 1, roast: "medium" }
      }
    },
    planningDefaults: {
      deliveryWindowLatestAt: "2026-03-24T18:00:00+08:00",
      budgetLimit: 120
    },
    offerProductId: "coffee-1kg",
    offerDeliveryEta: "2026-03-24T16:30:00+08:00",
    offers: [
      { sellerId: "office_supply_prime", totalCost: 18, etaHours: 8, trust: 0.93, policyMatch: 1 },
      { sellerId: "warehouse_bulk", totalCost: 16, etaHours: 18, trust: 0.67, policyMatch: 0.78 }
    ],
    defaultAutoApproveLimit: 120
  }
};

export const getProcurementScenario = (
  scenarioId: ProcurementScenarioId = "home"
): ProcurementScenarioDefinition => SCENARIOS[scenarioId];
