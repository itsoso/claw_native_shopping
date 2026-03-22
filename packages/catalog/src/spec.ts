import { z } from "zod";

export const CatalogAttributeValueSchema = z.union([z.string(), z.number(), z.boolean()]);

export const CatalogAttributesSchema = z.record(CatalogAttributeValueSchema);

export const CatalogProductSpecSchema = z.object({
  sellerProductId: z.string(),
  category: z.string(),
  attributes: CatalogAttributesSchema
});

export const CanonicalProductSpecSchema = z.object({
  sellerProductId: z.string(),
  category: z.string(),
  attributes: CatalogAttributesSchema
});

export type CatalogProductSpec = z.infer<typeof CatalogProductSpecSchema>;
export type CanonicalProductSpec = z.infer<typeof CanonicalProductSpecSchema>;
