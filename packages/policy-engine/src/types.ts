export type PolicyProfile = {
  autoApproveLimit?: number;
  blockedSellers: string[];
  requiredCertifications: string[];
  substitutionRules?: "allowed" | "disallowed";
};

export type PurchaseContext = {
  totalAmount: number;
  sellerId: string;
  certifications: string[];
  substitutionsRequested?: boolean;
};

export type PolicyDecisionReason =
  | "over_auto_approve_limit"
  | "seller_blocked"
  | "missing_required_certification"
  | "substitutions_disallowed";

export type PolicyDecision = "approved" | "approval_required" | "rejected";

export type PolicyEvaluationResult = {
  decision: PolicyDecision;
  requiresApproval: boolean;
  hardBlocked: boolean;
  approvedAutomatically: boolean;
  reasons: PolicyDecisionReason[];
  substitutionAllowed: boolean;
};
