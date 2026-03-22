import { z } from "zod";

const DeliveryWindowSchema = z.object({
  latestAt: z.string()
});

export const DemandIntentSchema = z.object({
  id: z.string(),
  category: z.string(),
  normalizedAttributes: z.record(z.unknown()),
  quantity: z.number().int().positive(),
  urgency: z.string(),
  deliveryWindow: DeliveryWindowSchema,
  budgetLimit: z.number().nonnegative(),
  substitutionPolicy: z.string(),
  sourceSignals: z.array(z.string())
});

export type DemandIntent = z.infer<typeof DemandIntentSchema>;
