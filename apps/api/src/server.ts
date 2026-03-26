import type { FastifyInstance } from "fastify";
import Fastify from "fastify";
import { pathToFileURL } from "node:url";
import { createMemoryStore } from "../../../packages/memory/src/store.js";
import { createSellerHttpPort } from "../../../packages/seller-protocol/src/httpPort.js";
import type { SellerProtocolPort } from "../../../packages/seller-protocol/src/port.js";
import { registerIntentRoutes } from "./routes/intents.js";
import { registerOrderRoutes } from "./routes/orders.js";

export type ServerStartOptions = {
  port?: number;
  host?: string;
  sellerBaseUrl?: string;
  sellerPort?: SellerProtocolPort;
};

const DEFAULT_SELLER_SIM_BASE_URL = "http://127.0.0.1:3100";

export const buildServer = (options: ServerStartOptions = {}): FastifyInstance => {
  const app = Fastify({ logger: false });
  const store = createMemoryStore();
  const sellerPort =
    options.sellerPort ??
    createSellerHttpPort({
      baseUrl:
        options.sellerBaseUrl ??
        process.env.SELLER_SIM_BASE_URL ??
        DEFAULT_SELLER_SIM_BASE_URL,
    });

  registerIntentRoutes(app, store, sellerPort);
  registerOrderRoutes(app, store);

  return app;
};

export const startApiServer = async (
  options: ServerStartOptions = {}
): Promise<{ app: FastifyInstance; baseUrl: string }> => {
  const app = buildServer(options);
  const host = options.host ?? process.env.HOST ?? "127.0.0.1";
  const port = options.port ?? Number.parseInt(process.env.PORT ?? "3000", 10);
  await app.listen({ host, port });

  const address = app.server.address();
  if (!address || typeof address === "string") {
    throw new Error("api_server_address_unavailable");
  }

  return {
    app,
    baseUrl: `http://${host}:${address.port}`
  };
};

const isEntrypoint = (): boolean => {
  const entrypoint = process.argv[1];
  return entrypoint !== undefined && pathToFileURL(entrypoint).href === import.meta.url;
};

if (isEntrypoint()) {
  startApiServer()
    .then(({ baseUrl }) => {
      console.log(`buyer api listening on ${baseUrl}`);
    })
    .catch((error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    });
}
