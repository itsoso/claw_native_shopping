import { z } from "zod";

const RFQItemSchema = z.object({
  category: z.string(),
  quantity: z.number().int().positive()
});

export const RFQSchema = z.object({
  rfqId: z.string(),
  buyerAgentId: z.string(),
  category: z.string(),
  quantity: z.number().int().positive(),
  requestedAt: z.string().optional(),
  items: z.array(RFQItemSchema).optional()
});

const QuoteItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative()
});

export const QuoteSchema = z.object({
  quoteId: z.string(),
  rfqId: z.string(),
  sellerAgentId: z.string(),
  items: z.array(QuoteItemSchema).min(1),
  shippingFee: z.number().nonnegative().default(0),
  taxFee: z.number().nonnegative().default(0),
  deliveryEta: z.string().optional(),
  inventoryHoldTtlSec: z.number().int().positive().optional(),
  serviceTerms: z.record(z.unknown()).default({})
});

export const InventoryHoldSchema = z.object({
  holdId: z.string(),
  rfqId: z.string(),
  quoteId: z.string(),
  sellerAgentId: z.string(),
  expiresAt: z.string()
});

export const OrderCommitSchema = z.object({
  orderId: z.string(),
  rfqId: z.string(),
  quoteId: z.string(),
  sellerAgentId: z.string(),
  committedAt: z.string()
});

export type RFQ = z.infer<typeof RFQSchema>;
export type Quote = z.infer<typeof QuoteSchema>;
export type InventoryHold = z.infer<typeof InventoryHoldSchema>;
export type OrderCommit = z.infer<typeof OrderCommitSchema>;
