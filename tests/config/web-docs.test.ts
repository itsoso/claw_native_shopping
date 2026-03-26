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
    expect(readme).toContain("pnpm dev:api");
    expect(readme).toContain("pnpm dev:seller-sim");
    expect(readme).toContain("`开始演示`");
    expect(readme).toContain("live request path itself stays fixed");
    expect(readme).toContain("(docs/web-validation-console.md)");
    expect(docs).toContain("Demo");
    expect(docs).toContain("Live");
    expect(docs).toContain("/health");
    expect(docs).toContain("投资人");
    expect(docs).toContain("开始演示");
    expect(docs).toContain("Unknown");
    expect(docs).toContain("只影响页面上的演示文案");
    expect(docs).toContain("pnpm test");
    expect(docs).toContain("pnpm test:e2e");
    expect(packageJson.scripts?.["dev:web"]).toBeTruthy();
    expect(packageJson.scripts?.["dev:api"]).toBeTruthy();
    expect(packageJson.scripts?.["dev:seller-sim"]).toBeTruthy();
    expect(packageJson.scripts?.test).toBeTruthy();
    expect(packageJson.scripts?.["test:e2e"]).toBeTruthy();
  });
});
