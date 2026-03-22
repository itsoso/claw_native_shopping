import type { FastifyInstance } from "fastify";
import type { MemoryStore } from "../../../../packages/memory/src/store.js";

export const registerOrderRoutes = (app: FastifyInstance, store: MemoryStore): void => {
  app.get("/orders/:id", async (request, reply) => {
    const orderId = (request.params as { id: string }).id;
    const snapshot = store.getOrderSnapshot(orderId);

    if (!snapshot) {
      return reply.code(404).send({ error: "order_not_found" });
    }

    return reply.send(snapshot);
  });

  app.get("/orders/:id/explanation", async (request, reply) => {
    const orderId = (request.params as { id: string }).id;
    const snapshot = store.getOrderSnapshot(orderId);

    if (!snapshot) {
      return reply.code(404).send({ error: "order_not_found" });
    }

    return reply.send({
      orderId,
      explanation: store.getAuditEvents(orderId),
      snapshot
    });
  });
};
