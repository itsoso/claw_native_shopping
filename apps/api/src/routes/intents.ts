import type { FastifyInstance } from "fastify";
import type { MemoryStore } from "../../../../packages/memory/src/store.js";
import { runProcurementScenario } from "../../../../packages/orchestrator/src/service.js";

export const registerIntentRoutes = (app: FastifyInstance, store: MemoryStore): void => {
  app.get("/health", async () => {
    return {
      status: "ok",
      service: "buyer-api"
    };
  });

  app.post("/intents/replenish", async () => {
    const result = await runProcurementScenario({ store });

    return result;
  });
};
