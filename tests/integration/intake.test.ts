import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { buildServer } from "../../apps/api/src/server.js";

describe("release intake api", () => {
  it("persists feedback and interest submissions into the configured local data directory", async () => {
    const dataDir = await mkdtemp(join(tmpdir(), "openclaw-intake-"));
    const app = buildServer({ intakeDataDir: dataDir });

    try {
      const feedbackResponse = await app.inject({
        method: "POST",
        url: "/intake/feedback",
        payload: {
          scenarioId: "replenish-laundry",
          rating: 4,
          message: "解释足够清楚，但我想先看真实商品。",
        },
      });
      const interestResponse = await app.inject({
        method: "POST",
        url: "/intake/interest",
        payload: {
          email: "tester@example.com",
          source: "release-web",
        },
      });

      expect(feedbackResponse.statusCode).toBe(202);
      expect(interestResponse.statusCode).toBe(202);

      const feedbackLog = await readFile(join(dataDir, "feedback.jsonl"), "utf8");
      const interestLog = await readFile(join(dataDir, "interest.jsonl"), "utf8");

      expect(feedbackLog).toContain("replenish-laundry");
      expect(feedbackLog).toContain("解释足够清楚");
      expect(interestLog).toContain("tester@example.com");
      expect(interestLog).toContain("release-web");
    } finally {
      await app.close();
    }
  });

  it("rejects invalid email submissions", async () => {
    const dataDir = await mkdtemp(join(tmpdir(), "openclaw-intake-"));
    const app = buildServer({ intakeDataDir: dataDir });

    try {
      const response = await app.inject({
        method: "POST",
        url: "/intake/interest",
        payload: {
          email: "not-an-email",
        },
      });

      expect(response.statusCode).toBe(400);
    } finally {
      await app.close();
    }
  });
});
