import { describe, expect, it } from "vitest";

import {
  VerificationReportSchema,
} from "../../packages/contracts/src/verification-report.js";
import {
  VerificationRequestSchema,
  VerificationRequestResultSchema,
} from "../../packages/contracts/src/verification-request.js";

describe("VerificationReportSchema", () => {
  it("parses a valid verification report", () => {
    const input = {
      skuId: "ks_beef_001",
      verified: true,
      verificationCount: 2,
      records: [
        {
          verifierId: "anchor_zhang",
          verifierTrustScore: 0.91,
          verifierCategoryExpertise: "food.dried_meat",
          date: "2026-03-10",
          method: "live_tasting",
          structuredAssessment: {
            texture: "适中偏硬，有嚼劲",
            flavor: "原味，微咸",
            appearance: "色泽均匀",
            overallGrade: "A",
          },
          evidenceUrls: ["https://example.com/video1"],
        },
      ],
      communitySignal: {
        repeatPurchaseRate: 0.34,
        positiveFeedbackRatio: 0.89,
        sampleSize: 1247,
      },
      updatedAt: "2026-03-15T10:00:00Z",
    };

    const result = VerificationReportSchema.parse(input);
    expect(result.skuId).toBe("ks_beef_001");
    expect(result.verified).toBe(true);
    expect(result.records).toHaveLength(1);
    expect(result.records[0]!.structuredAssessment.overallGrade).toBe("A");
    expect(result.communitySignal?.sampleSize).toBe(1247);
  });

  it("applies default for evidenceUrls", () => {
    const input = {
      skuId: "ks_test",
      verified: false,
      verificationCount: 0,
      records: [],
      updatedAt: "2026-04-01",
    };

    const result = VerificationReportSchema.parse(input);
    expect(result.records).toEqual([]);
    expect(result.communitySignal).toBeUndefined();
  });

  it("rejects invalid overallGrade", () => {
    const input = {
      skuId: "ks_test",
      verified: true,
      verificationCount: 1,
      records: [
        {
          verifierId: "v1",
          verifierTrustScore: 0.8,
          verifierCategoryExpertise: "food",
          date: "2026-01-01",
          method: "live_tasting",
          structuredAssessment: {
            texture: "soft",
            flavor: "sweet",
            appearance: "good",
            overallGrade: "E",
          },
        },
      ],
      updatedAt: "2026-01-01",
    };

    expect(() => VerificationReportSchema.parse(input)).toThrow();
  });

  it("rejects invalid method", () => {
    const input = {
      skuId: "ks_test",
      verified: true,
      verificationCount: 1,
      records: [
        {
          verifierId: "v1",
          verifierTrustScore: 0.8,
          verifierCategoryExpertise: "food",
          date: "2026-01-01",
          method: "taste_test",
          structuredAssessment: {
            texture: "soft",
            flavor: "sweet",
            appearance: "good",
            overallGrade: "A",
          },
        },
      ],
      updatedAt: "2026-01-01",
    };

    expect(() => VerificationReportSchema.parse(input)).toThrow();
  });
});

describe("VerificationRequestSchema", () => {
  it("parses a valid verification request", () => {
    const input = {
      skuId: "ks_jade_003",
      verificationType: "expert_inspection",
      urgency: "standard",
      aspects: ["authenticity", "quality"],
      budgetCents: 5000,
    };

    const result = VerificationRequestSchema.parse(input);
    expect(result.skuId).toBe("ks_jade_003");
    expect(result.aspects).toEqual(["authenticity", "quality"]);
  });

  it("rejects empty aspects array", () => {
    const input = {
      skuId: "ks_test",
      verificationType: "ai_auto",
      urgency: "express",
      aspects: [],
    };

    expect(() => VerificationRequestSchema.parse(input)).toThrow();
  });
});

describe("VerificationRequestResultSchema", () => {
  it("parses a matched result with assigned verifier", () => {
    const input = {
      requestId: "vreq_001",
      status: "matched",
      assignedVerifier: {
        verifierId: "anchor_li",
        estimatedCompletionHours: 24,
      },
      costCents: 3000,
    };

    const result = VerificationRequestResultSchema.parse(input);
    expect(result.status).toBe("matched");
    expect(result.assignedVerifier?.verifierId).toBe("anchor_li");
  });

  it("parses a pending result without verifier", () => {
    const input = {
      requestId: "vreq_002",
      status: "pending",
    };

    const result = VerificationRequestResultSchema.parse(input);
    expect(result.assignedVerifier).toBeUndefined();
    expect(result.costCents).toBeUndefined();
  });
});
