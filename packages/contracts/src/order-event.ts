import { z } from "zod";

export const OrderEventSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  type: z.string(),
  occurredAt: z.string(),
  payload: z.record(z.unknown()).default({})
});

export type OrderEvent = z.infer<typeof OrderEventSchema>;
