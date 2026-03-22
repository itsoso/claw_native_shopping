import type { CanonicalProductSpec } from "./spec.js";

const isPrimitiveEqual = (left: unknown, right: unknown) => Object.is(left, right);

export const scoreSubstitution = (base: CanonicalProductSpec, candidate: CanonicalProductSpec): number => {
  if (base.category !== candidate.category) {
    return 0;
  }

  const keys = new Set([...Object.keys(base.attributes), ...Object.keys(candidate.attributes)]);
  if (keys.size === 0) {
    return 1;
  }

  let matches = 0;
  for (const key of keys) {
    if (isPrimitiveEqual(base.attributes[key], candidate.attributes[key])) {
      matches += 1;
    }
  }

  return matches / keys.size;
};
