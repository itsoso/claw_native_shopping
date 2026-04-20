import { describe, expect, it } from "vitest";

import { startVerificationServer } from "../../apps/verification-api/src/server.js";

describe("verification-api server", () => {
  it("starts an HTTP listener and responds to health check", async () => {
    const { app, baseUrl } = await startVerificationServer({ port: 0 });

    try {
      const response = await fetch(`${baseUrl}/health`);
      expect(response.ok).toBe(true);
      const body = (await response.json()) as { status: string; service: string };
      expect(body.status).toBe("ok");
      expect(body.service).toBe("verification-api");
    } finally {
      await app.close();
    }
  });
});
