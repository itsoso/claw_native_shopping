import type { FastifyInstance } from "fastify";
import type { MemoryStore } from "../../../../packages/memory/src/store.js";
import { runProcurementScenario } from "../../../../packages/orchestrator/src/service.js";

export const registerIntentRoutes = (app: FastifyInstance, store: MemoryStore): void => {
  app.post("/intents/replenish", async () => {
    const result = await runProcurementScenario();

    store.appendAuditEvent(result.orderId, { type: "INTENT_REPLENISH_REQUESTED" });
    store.setOrderSnapshot({
      orderId: result.orderId,
      status: result.status
    });

    return result;
  });
};
