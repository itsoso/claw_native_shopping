import type { FastifyInstance } from "fastify";
import Fastify from "fastify";
import { pathToFileURL } from "node:url";
import { registerVerificationHandlers } from "./handlers.js";

export type ServerStartOptions = {
  port?: number;
  host?: string;
};

export const buildVerificationServer = (): FastifyInstance => {
  const app = Fastify({ logger: false });
  registerVerificationHandlers(app);
  return app;
};

export const startVerificationServer = async (
  options: ServerStartOptions = {}
): Promise<{ app: FastifyInstance; baseUrl: string }> => {
  const app = buildVerificationServer();
  const host = options.host ?? process.env.HOST ?? "127.0.0.1";
  const port = options.port ?? Number.parseInt(process.env.PORT ?? "3200", 10);
  await app.listen({ host, port });

  const address = app.server.address();
  if (!address || typeof address === "string") {
    throw new Error("verification_api_address_unavailable");
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
  startVerificationServer()
    .then(({ baseUrl }) => {
      console.log(`verification api listening on ${baseUrl}`);
    })
    .catch((error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    });
}
