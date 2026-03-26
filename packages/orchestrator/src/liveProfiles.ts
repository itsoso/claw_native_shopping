import type { DemandPlannerInput } from "../../../packages/demand-planner/src/types.js";
import type {
  LiveMode,
  LiveReplenishmentRequest,
  LiveScenarioId,
} from "../../../packages/contracts/src/live-replenishment.js";

type LiveScenarioProfile = {
  sku: string;
  category: string;
  quantityOnHand: number;
  reorderPoint: number;
  normalizedAttributes: Record<string, unknown>;
  baseBudgetLimit: number;
};

const liveScenarioProfiles: Record<LiveScenarioId, LiveScenarioProfile> = {
  "replenish-laundry": {
    sku: "laundry-2l",
    category: "laundry-detergent",
    quantityOnHand: 1,
    reorderPoint: 3,
    normalizedAttributes: { size_liters: 2, format: "bottle" },
    baseBudgetLimit: 90,
  },
  "optimize-cart-threshold": {
    sku: "softener-1l",
    category: "cart-threshold-booster",
    quantityOnHand: 0,
    reorderPoint: 2,
    normalizedAttributes: { size_liters: 1, role: "threshold_booster" },
    baseBudgetLimit: 55,
  },
  "seller-eta-tradeoff": {
    sku: "stain-remover-500ml",
    category: "seller-eta-balance",
    quantityOnHand: 0,
    reorderPoint: 1,
    normalizedAttributes: { size_ml: 500, priority: "eta_balance" },
    baseBudgetLimit: 45,
  },
};

const modeConfig: Record<
  LiveMode,
  { budgetDelta: number; deliveryWindowLatestAt: string; policyAutoApproveLimit: number }
> = {
  time_saving: {
    budgetDelta: 20,
    deliveryWindowLatestAt: "2026-03-24T09:00:00+08:00",
    policyAutoApproveLimit: 140,
  },
  safe: {
    budgetDelta: 10,
    deliveryWindowLatestAt: "2026-03-24T12:00:00+08:00",
    policyAutoApproveLimit: 110,
  },
  value: {
    budgetDelta: 0,
    deliveryWindowLatestAt: "2026-03-25T18:00:00+08:00",
    policyAutoApproveLimit: 80,
  },
};

export const buildLiveProcurementProfile = (
  request: LiveReplenishmentRequest,
): {
  planningInput: DemandPlannerInput;
  policyAutoApproveLimit: number;
  requestMetadata: {
    scenarioId: LiveScenarioId;
    mode: LiveMode;
  };
} => {
  const scenarioProfile = liveScenarioProfiles[request.scenarioId];
  const modeProfile = modeConfig[request.mode];

  return {
    planningInput: {
      inventory: [
        {
          sku: scenarioProfile.sku,
          quantityOnHand: scenarioProfile.quantityOnHand,
          reorderPoint: scenarioProfile.reorderPoint,
        },
      ],
      catalogMap: {
        [scenarioProfile.sku]: {
          category: scenarioProfile.category,
          normalizedAttributes: scenarioProfile.normalizedAttributes,
        },
      },
      planningDefaults: {
        deliveryWindowLatestAt: modeProfile.deliveryWindowLatestAt,
        budgetLimit: scenarioProfile.baseBudgetLimit + modeProfile.budgetDelta,
      },
    },
    policyAutoApproveLimit: modeProfile.policyAutoApproveLimit,
    requestMetadata: {
      scenarioId: request.scenarioId,
      mode: request.mode,
    },
  };
};
