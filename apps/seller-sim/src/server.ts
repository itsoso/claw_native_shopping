import Fastify from "fastify";
import { registerSellerSimHandlers } from "./handlers.js";

export const buildSellerSimServer = () => {
  const app = Fastify({ logger: false });
  registerSellerSimHandlers(app);
  return app;
};
