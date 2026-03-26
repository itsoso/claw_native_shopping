import type { FastifyInstance } from "fastify";
import type { MemoryStore } from "../../../../packages/memory/src/store.js";
import { runProcurementScenario } from "../../../../packages/orchestrator/src/service.js";
import type { SellerProtocolPort } from "../../../../packages/seller-protocol/src/port.js";

export const registerIntentRoutes = (
  app: FastifyInstance,
  store: MemoryStore,
  sellerPort: SellerProtocolPort,
): void => {
  app.get("/health", async () => {
    return {
      status: "ok",
      service: "buyer-api"
    };
  });

  app.post("/intents/replenish", async () => {
    const result = await runProcurementScenario({ store, sellerPort });

    return result;
  });
};
