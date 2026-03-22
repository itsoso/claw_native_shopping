import type { DemandIntent } from "../../contracts/src/demand-intent.js";

export type DemandPlannerInventoryItem = {
  sku: string;
  quantityOnHand: number;
  reorderPoint: number;
};

export type DemandPlannerCatalogEntry = {
  category: string;
  normalizedAttributes: DemandIntent["normalizedAttributes"];
};

export type DemandPlannerInput = {
  inventory: DemandPlannerInventoryItem[];
  catalogMap: Record<string, DemandPlannerCatalogEntry>;
  planningDefaults: DemandPlannerPlanningDefaults;
};

export type DemandPlannerPlanningDefaults = {
  deliveryWindowLatestAt: string;
  budgetLimit: number;
};

export type { DemandIntent };
