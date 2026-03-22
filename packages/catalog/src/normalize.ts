import { CanonicalProductSpecSchema, CatalogProductSpecSchema, type CanonicalProductSpec, type CatalogProductSpec } from "./spec.js";

const toSnakeCase = (value: string): string =>
  value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();

const normalizeEggAttributes = (attributes: CatalogProductSpec["attributes"]): CanonicalProductSpec["attributes"] => {
  const count = attributes.count;
  const raisingMethod = attributes.raisingMethod;

  if (count === undefined) {
    throw new Error("Missing egg count");
  }

  if (typeof raisingMethod !== "string") {
    throw new Error("Missing egg raisingMethod");
  }

  const normalizedCount = typeof count === "string" ? Number.parseInt(count, 10) : count;

  if (typeof normalizedCount !== "number" || Number.isNaN(normalizedCount)) {
    throw new Error("Invalid egg count");
  }

  return {
    count: normalizedCount,
    raising_method: toSnakeCase(raisingMethod)
  };
};

const normalizeAttributes = (category: string, attributes: CatalogProductSpec["attributes"]): CanonicalProductSpec["attributes"] => {
  if (category === "eggs") {
    return normalizeEggAttributes(attributes);
  }

  return Object.fromEntries(
    Object.entries(attributes).map(([key, value]) => [toSnakeCase(key), value])
  ) as CanonicalProductSpec["attributes"];
};

export const normalizeProductSpec = (input: CatalogProductSpec): CanonicalProductSpec => {
  const parsed = CatalogProductSpecSchema.parse(input);

  return CanonicalProductSpecSchema.parse({
    sellerProductId: parsed.sellerProductId,
    category: parsed.category,
    attributes: normalizeAttributes(parsed.category, parsed.attributes)
  });
};
