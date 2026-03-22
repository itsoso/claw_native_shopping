import Fastify from "fastify";
import { createMemoryStore } from "../../../packages/memory/src/store.js";
import { registerIntentRoutes } from "./routes/intents.js";
import { registerOrderRoutes } from "./routes/orders.js";

export const buildServer = () => {
  const app = Fastify({ logger: false });
  const store = createMemoryStore();

  store.appendAuditEvent("order_1", { type: "SEED_ORDER" });
  store.setOrderSnapshot({
    orderId: "order_1",
    status: "orderCommitted"
  });

  registerIntentRoutes(app, store);
  registerOrderRoutes(app, store);

  return app;
};
