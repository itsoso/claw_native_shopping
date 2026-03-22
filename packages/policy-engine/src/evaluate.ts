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

  const hardBlocked = reasons.some(
    (reason) => reason === "seller_blocked" || reason === "missing_required_certification"
  );
  const decision = hardBlocked
    ? "rejected"
    : reasons.includes("over_auto_approve_limit") || reasons.includes("substitutions_disallowed")
      ? "approval_required"
      : "approved";
  const requiresApproval = decision === "approval_required";
  const approvedAutomatically = decision === "approved";

  return {
    decision,
    requiresApproval,
    hardBlocked,
    approvedAutomatically,
    reasons,
    substitutionAllowed
  };
};
