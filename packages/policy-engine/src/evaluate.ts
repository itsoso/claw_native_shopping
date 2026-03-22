import type { PolicyEvaluationResult, PolicyProfile, PurchaseContext } from "./types.js";

const hasAllRequiredCertifications = (required: string[], actual: string[]): boolean =>
  required.every((certification) => actual.includes(certification));

export const evaluatePolicy = (
  policy: PolicyProfile,
  purchase: PurchaseContext
): PolicyEvaluationResult => {
  const reasons: PolicyEvaluationResult["reasons"] = [];

  const autoApproveLimit = policy.autoApproveLimit ?? Number.POSITIVE_INFINITY;
  if (purchase.totalAmount > autoApproveLimit) {
    reasons.push("over_auto_approve_limit");
  }

  if (policy.blockedSellers.includes(purchase.sellerId)) {
    reasons.push("seller_blocked");
  }

  if (!hasAllRequiredCertifications(policy.requiredCertifications, purchase.certifications)) {
    reasons.push("missing_required_certification");
  }

  const substitutionAllowed = (policy.substitutionRules ?? "allowed") === "allowed";
  if (purchase.substitutionsRequested && !substitutionAllowed) {
    reasons.push("substitutions_disallowed");
  }

  const approvedAutomatically = reasons.length === 0;

  return {
    requiresApproval: !approvedAutomatically,
    approvedAutomatically,
    reasons,
    substitutionAllowed
  };
};
