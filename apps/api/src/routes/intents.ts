import type { FastifyInstance } from "fastify";
import type { MemoryStore } from "../../../../packages/memory/src/store.js";
import { runProcurementScenario } from "../../../../packages/orchestrator/src/service.js";

export const registerIntentRoutes = (app: FastifyInstance, store: MemoryStore): void => {
  // Health probe for the Web validation console Ops Dock.
  app.get("/health", async () => ({ status: "ok" as const, service: "buyer-api" as const }));

  app.post("/intents/replenish", async () => {
    const result = await runProcurementScenario({ store });

    return result;
  });
};
