import { describe, expect, it } from "vitest";
import { evaluatePolicy } from "../../packages/policy-engine/src/evaluate.js";

describe("evaluatePolicy", () => {
  it("requires approval when total amount exceeds the auto-approve limit", () => {
    const result = evaluatePolicy(
      { autoApproveLimit: 50, blockedSellers: [], requiredCertifications: [] },
      { totalAmount: 55, sellerId: "seller_1", certifications: [] }
    );

    expect(result.requiresApproval).toBe(true);
    expect(result.decision).toBe("approval_required");
    expect(result.hardBlocked).toBe(false);
  });

  it("rejects blocked sellers", () => {
    const result = evaluatePolicy(
      { autoApproveLimit: 50, blockedSellers: ["seller_1"], requiredCertifications: [] },
      { totalAmount: 40, sellerId: "seller_1", certifications: [] }
    );

    expect(result.decision).toBe("rejected");
    expect(result.requiresApproval).toBe(false);
    expect(result.hardBlocked).toBe(true);
  });

  it("rejects missing certifications", () => {
    const result = evaluatePolicy(
      { autoApproveLimit: 50, blockedSellers: [], requiredCertifications: ["organic"] },
      { totalAmount: 40, sellerId: "seller_1", certifications: [] }
    );

    expect(result.decision).toBe("rejected");
    expect(result.requiresApproval).toBe(false);
    expect(result.hardBlocked).toBe(true);
  });
});
