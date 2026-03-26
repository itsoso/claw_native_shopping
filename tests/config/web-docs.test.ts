import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("web validation docs", () => {
  it("documents how to run the web console in demo and live mode", () => {
    const readme = readFileSync("README.md", "utf8");
    const docs = readFileSync("docs/web-validation-console.md", "utf8");
    const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
      scripts?: Record<string, string>;
    };

    expect(readme).toContain("OpenClaw Web Validation Console");
    expect(readme).toContain("pnpm dev:web");
    expect(readme).toContain("pnpm preview:web");
    expect(readme).toContain("pnpm dev:api");
    expect(readme).toContain("pnpm dev:seller-sim");
    expect(readme).toContain("built-in same-origin proxy");
    expect(readme).toContain("OPENCLAW_LIVE_API_TARGET");
    expect(readme).toContain("OPENCLAW_LIVE_SELLER_TARGET");
    expect(readme).toContain("seller-sim");
    expect(readme).toContain("(docs/web-validation-console.md)");
    expect(docs).toContain("Demo");
    expect(docs).toContain("Live");
    expect(docs).toContain("/health");
    expect(docs).toContain("投资人");
    expect(docs).toContain("开始演示");
    expect(docs).toContain("Unknown");
    expect(docs).toContain("只影响页面上的演示文案");
    expect(docs).toContain("same-origin proxy");
    expect(docs).toContain("pnpm preview:web");
    expect(docs).toContain("OPENCLAW_LIVE_API_TARGET");
    expect(docs).toContain("OPENCLAW_LIVE_SELLER_TARGET");
    expect(docs).toContain("seller-sim 目前只参与 health probe");
    expect(docs).toContain("pnpm test");
    expect(docs).toContain("pnpm test:e2e");
    expect(docs).not.toContain("still needs a same-origin proxy or explicit `CORS` support");
    expect(docs).not.toContain("needs same-origin proxy / `CORS` wiring");
    expect(packageJson.scripts?.["dev:web"]).toBe("pnpm --dir apps/web dev");
    expect(packageJson.scripts?.["dev:api"]).toBe("tsx apps/api/src/server.ts");
    expect(packageJson.scripts?.["dev:seller-sim"]).toBe("tsx apps/seller-sim/src/server.ts");
    expect(packageJson.scripts?.test).toBe("vitest run");
    expect(packageJson.scripts?.["test:e2e"]).toBe("playwright test");
  });
});
