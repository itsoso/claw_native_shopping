import type { FastifyInstance } from "fastify";
import { LiveReplenishmentRequestSchema } from "../../../../packages/contracts/src/live-replenishment.js";
import type { MemoryStore } from "../../../../packages/memory/src/store.js";
import { buildLiveProcurementProfile } from "../../../../packages/orchestrator/src/liveProfiles.js";
import {
  runProcurementScenario,
  type SellerQuoteCollector
} from "../../../../packages/orchestrator/src/service.js";
import type { SellerProtocolPort } from "../../../../packages/seller-protocol/src/port.js";

export const registerIntentRoutes = (
  app: FastifyInstance,
  store: MemoryStore,
  sellerPort: SellerProtocolPort,
  quoteCollector?: SellerQuoteCollector,
): void => {
  app.get("/health", async () => {
    return {
      status: "ok",
      service: "buyer-api"
    };
  });

  app.post("/intents/replenish", async (request) => {
    const payload = LiveReplenishmentRequestSchema.parse({
      scenarioId: "replenish-laundry",
      mode: "time_saving",
      ...((typeof request.body === "object" && request.body !== null)
        ? (request.body as Record<string, unknown>)
        : {}),
    });
    const profile = buildLiveProcurementProfile(payload);
    const result = await runProcurementScenario({
      store,
      sellerPort,
      ...(quoteCollector ? { quoteCollector } : {}),
      planningInput: profile.planningInput,
      policyAutoApproveLimit: profile.policyAutoApproveLimit,
      requestMetadata: profile.requestMetadata,
    });

    return result;
  });
};
