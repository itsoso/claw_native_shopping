import Fastify from "fastify";
import { createMemoryStore } from "../../../packages/memory/src/store.js";
import { registerIntentRoutes } from "./routes/intents.js";
import { registerOrderRoutes } from "./routes/orders.js";

export const buildServer = () => {
  const app = Fastify({ logger: false });
  const store = createMemoryStore();

  registerIntentRoutes(app, store);
  registerOrderRoutes(app, store);

  return app;
};
