import { z } from "zod";

export const PolicyProfileSchema = z.object({
  autoApproveLimit: z.number().nonnegative().optional(),
  monthlyBudgetCaps: z.record(z.number().nonnegative()).optional(),
  preferredBrands: z.array(z.string()).default([]),
  requiredCertifications: z.array(z.string()).default([]),
  blockedSellers: z.array(z.string()).default([]),
  deliveryConstraints: z
    .object({
      earliestAt: z.string().optional(),
      latestAt: z.string().optional()
    })
    .optional(),
  substitutionRules: z.string().optional()
});

export type PolicyProfile = z.infer<typeof PolicyProfileSchema>;
