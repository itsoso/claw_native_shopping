import { z } from "zod";

export const ReplenishRequestSchema = z.object({
  scenarioId: z.enum(["home", "office"]).optional(),
  demo: z
    .object({
      forceApproval: z.boolean().optional(),
      forceInventoryHoldFailure: z.boolean().optional()
    })
    .optional()
});

export type ReplenishRequest = z.infer<typeof ReplenishRequestSchema>;
