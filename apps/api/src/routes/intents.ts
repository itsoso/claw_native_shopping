import type { FastifyInstance } from "fastify";
import type { MemoryStore } from "../../../../packages/memory/src/store.js";
import { runProcurementScenario } from "../../../../packages/orchestrator/src/service.js";
import { ReplenishRequestSchema } from "./schemas.js";

export const registerIntentRoutes = (app: FastifyInstance, store: MemoryStore): void => {
  app.post("/intents/replenish", async (request) => {
    const input = ReplenishRequestSchema.parse(request.body ?? {});
    const result = await runProcurementScenario({
      store,
      scenarioId: input.scenarioId ?? "home",
      ...(input.demo?.forceApproval ? { policyAutoApproveLimit: 10 } : {}),
      ...(input.demo?.forceInventoryHoldFailure ? { inventoryHoldShouldFail: true } : {})
    });

    return result;
  });
};
