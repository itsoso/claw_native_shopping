import type { FastifyInstance } from "fastify";
import Fastify from "fastify";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createMemoryStore } from "../../../packages/memory/src/store.js";
import { createIntakeStore } from "./intake/store.js";
import { registerIntentRoutes } from "./routes/intents.js";
import { registerIntakeRoutes } from "./routes/intake.js";
import { registerOrderRoutes } from "./routes/orders.js";
import { resolveSellerRuntime, type SellerRuntimeOptions } from "./sellerRuntime.js";

export type ServerStartOptions = SellerRuntimeOptions & {
  port?: number;
  host?: string;
  intakeDataDir?: string;
};

export const buildServer = (options: ServerStartOptions = {}): FastifyInstance => {
  const app = Fastify({ logger: false });
  const store = createMemoryStore();
  const intakeStore = createIntakeStore({
    dataDir:
      options.intakeDataDir ??
      process.env.OPENCLAW_INTAKE_DATA_DIR ??
      resolve(process.cwd(), ".local", "release-intake"),
  });
  const { sellerPort, quoteCollector } = resolveSellerRuntime(options);

  registerIntentRoutes(app, store, sellerPort, quoteCollector);
  registerOrderRoutes(app, store);
  registerIntakeRoutes(app, intakeStore);

  return app;
};

export const startApiServer = async (
  options: ServerStartOptions = {}
): Promise<{ app: FastifyInstance; baseUrl: string }> => {
  const app = buildServer(options);
  const host = options.host ?? process.env.HOST ?? "127.0.0.1";
  const port = options.port ?? Number.parseInt(process.env.PORT ?? "4300", 10);
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
