import { z } from "zod";

const OfferItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative()
});

export const OfferSchema = z.object({
  id: z.string(),
  rfqId: z.string(),
  sellerId: z.string(),
  items: z.array(OfferItemSchema).min(1),
  shippingFee: z.number().nonnegative().default(0),
  taxFee: z.number().nonnegative().default(0),
  deliveryEta: z.string().optional(),
  inventoryHoldTtlSec: z.number().int().positive().optional(),
  serviceTerms: z.record(z.unknown()).default({})
});

export type Offer = z.infer<typeof OfferSchema>;
