import { z } from "zod";

const VerificationAssessmentSchema = z.object({
  texture: z.string(),
  flavor: z.string(),
  appearance: z.string(),
  overallGrade: z.enum(["A", "B", "C", "D"]),
  notes: z.string().optional(),
});

const CommunitySignalSchema = z.object({
  repeatPurchaseRate: z.number().min(0).max(1),
  positiveFeedbackRatio: z.number().min(0).max(1),
  sampleSize: z.number().int().nonnegative(),
});

const VerificationRecordSchema = z.object({
  verifierId: z.string(),
  verifierTrustScore: z.number().min(0).max(1),
  verifierCategoryExpertise: z.string(),
  date: z.string(),
  method: z.enum(["live_tasting", "live_inspection", "photo_review", "lab_test"]),
  structuredAssessment: VerificationAssessmentSchema,
  evidenceUrls: z.array(z.string()).default([]),
});

export const VerificationReportSchema = z.object({
  skuId: z.string(),
  verified: z.boolean(),
  verificationCount: z.number().int().nonnegative(),
  records: z.array(VerificationRecordSchema),
  communitySignal: CommunitySignalSchema.optional(),
  updatedAt: z.string(),
});

export type VerificationReport = z.infer<typeof VerificationReportSchema>;
