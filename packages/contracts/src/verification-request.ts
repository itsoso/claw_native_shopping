import { z } from "zod";

const AssignedVerifierSchema = z.object({
  verifierId: z.string(),
  estimatedCompletionHours: z.number().nonnegative(),
});

export const VerificationRequestSchema = z.object({
  skuId: z.string(),
  verificationType: z.enum(["ai_auto", "hybrid", "expert_inspection"]),
  urgency: z.enum(["standard", "express"]),
  aspects: z.array(z.enum(["authenticity", "quality", "value_assessment"])).min(1),
  budgetCents: z.number().int().nonnegative().optional(),
});

export type VerificationRequest = z.infer<typeof VerificationRequestSchema>;

export const VerificationRequestResultSchema = z.object({
  requestId: z.string(),
  status: z.enum(["matched", "pending", "rejected"]),
  assignedVerifier: AssignedVerifierSchema.optional(),
  costCents: z.number().int().nonnegative().optional(),
});

export type VerificationRequestResult = z.infer<typeof VerificationRequestResultSchema>;
