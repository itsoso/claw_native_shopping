import { z } from "zod";

export const LiveScenarioIdSchema = z.enum([
  "replenish-laundry",
  "optimize-cart-threshold",
  "seller-eta-tradeoff",
]);

export const LiveModeSchema = z.enum(["time_saving", "safe", "value"]);

export const LiveReplenishmentRequestSchema = z.object({
  scenarioId: LiveScenarioIdSchema,
  mode: LiveModeSchema,
});

export type LiveScenarioId = z.infer<typeof LiveScenarioIdSchema>;
export type LiveMode = z.infer<typeof LiveModeSchema>;
export type LiveReplenishmentRequest = z.infer<
  typeof LiveReplenishmentRequestSchema
>;
