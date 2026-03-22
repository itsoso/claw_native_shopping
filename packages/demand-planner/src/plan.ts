import type { DemandIntent } from "../../contracts/src/demand-intent.js";
import type {
  DemandPlannerCatalogEntry,
  DemandPlannerInput,
  DemandPlannerInventoryItem
} from "./types.js";

const createIntentId = (sku: string): string => `intent_${sku}`;

const createDemandIntent = (
  item: DemandPlannerInventoryItem,
  catalogEntry: DemandPlannerCatalogEntry,
  planningDefaults: DemandPlannerInput["planningDefaults"]
): DemandIntent => ({
  id: createIntentId(item.sku),
  category: catalogEntry.category,
  normalizedAttributes: catalogEntry.normalizedAttributes,
  quantity: Math.max(1, item.reorderPoint - item.quantityOnHand),
  urgency: "soon",
  deliveryWindow: {
    latestAt: planningDefaults.deliveryWindowLatestAt
  },
  budgetLimit: planningDefaults.budgetLimit,
  substitutionPolicy: "allowed",
  sourceSignals: ["inventory_threshold"]
});

export const planDemand = (input: DemandPlannerInput): DemandIntent[] => {
  const intents: DemandIntent[] = [];

  for (const item of input.inventory) {
    if (item.quantityOnHand >= item.reorderPoint) {
      continue;
    }

    const catalogEntry = input.catalogMap[item.sku];
    if (!catalogEntry) {
      continue;
    }

    intents.push(createDemandIntent(item, catalogEntry, input.planningDefaults));
  }

  return intents;
};
