import type { FastifyInstance } from "fastify";

import { VerificationRequestSchema } from "../../../packages/contracts/src/verification-request.js";
import { verificationProducts } from "./data.js";

type SearchBody = {
  category?: string | undefined;
  has_verification?: boolean | undefined;
  sort_by?: string | undefined;
};

function bestGrade(report: { records: Array<{ structuredAssessment: { overallGrade: string } }> }): string | null {
  if (report.records.length === 0) return null;
  const grades = report.records.map((r) => r.structuredAssessment.overallGrade);
  const order = ["A", "B", "C", "D"];
  grades.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  return grades[0] ?? null;
}

export const registerVerificationHandlers = (app: FastifyInstance): void => {
  app.get("/health", async () => ({
    status: "ok" as const,
    service: "verification-api" as const,
  }));

  app.post("/v0.1/products/search", async (request) => {
    const body = (request.body ?? {}) as SearchBody;
    let results = verificationProducts;

    if (body.category) {
      results = results.filter((p) => p.category.startsWith(body.category!));
    }

    if (body.has_verification === true) {
      results = results.filter((p) => p.verificationReport.verified);
    }

    const summaries = results.map((p) => ({
      skuId: p.skuId,
      name: p.name,
      category: p.category,
      verified: p.verificationReport.verified,
      bestGrade: bestGrade(p.verificationReport),
      verificationCount: p.verificationReport.verificationCount,
      unitPriceCents: p.pricing.unitPriceCents,
    }));

    if (body.sort_by === "verification_score") {
      const gradeOrder: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
      summaries.sort((a, b) => {
        const ga = a.bestGrade ? (gradeOrder[a.bestGrade] ?? 4) : 4;
        const gb = b.bestGrade ? (gradeOrder[b.bestGrade] ?? 4) : 4;
        return ga - gb;
      });
    }

    return { products: summaries };
  });

  app.get("/v0.1/products/:skuId", async (request, reply) => {
    const { skuId } = request.params as { skuId: string };
    const product = verificationProducts.find((p) => p.skuId === skuId);

    if (!product) {
      return reply.code(404).send({ error: "product_not_found" });
    }

    return product;
  });

  app.get("/v0.1/products/:skuId/verification", async (request, reply) => {
    const { skuId } = request.params as { skuId: string };
    const product = verificationProducts.find((p) => p.skuId === skuId);

    if (!product) {
      return reply.code(404).send({ error: "product_not_found" });
    }

    return product.verificationReport;
  });

  app.post("/v0.1/verification/request", async (request, reply) => {
    const parsed = VerificationRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request", details: parsed.error.issues });
    }

    return {
      requestId: `vreq_${parsed.data.skuId}`,
      status: "matched" as const,
      assignedVerifier: {
        verifierId: "anchor_zhang",
        estimatedCompletionHours: parsed.data.urgency === "express" ? 4 : 24,
      },
      costCents: parsed.data.verificationType === "expert_inspection" ? 3000 : 500,
    };
  });
};
