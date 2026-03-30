import type { FastifyInstance } from "fastify";
import { z } from "zod";

import type { IntakeStore } from "../intake/store.js";

const FeedbackPayloadSchema = z.object({
  scenarioId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  message: z.string().min(1),
});

const InterestPayloadSchema = z.object({
  email: z.string().email(),
  source: z.string().min(1).default("release-web"),
});

export const registerIntakeRoutes = (
  app: FastifyInstance,
  store: IntakeStore,
): void => {
  app.post("/intake/feedback", async (request, reply) => {
    const payload = FeedbackPayloadSchema.safeParse(request.body);
    if (!payload.success) {
      return reply.status(400).send({
        error: "invalid_feedback_payload",
      });
    }

    await store.append("feedback", payload.data);
    return reply.status(202).send({ accepted: true });
  });

  app.post("/intake/interest", async (request, reply) => {
    const payload = InterestPayloadSchema.safeParse(request.body);
    if (!payload.success) {
      return reply.status(400).send({
        error: "invalid_interest_payload",
      });
    }

    await store.append("interest", payload.data);
    return reply.status(202).send({ accepted: true });
  });
};
