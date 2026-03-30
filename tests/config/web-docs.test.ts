import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("web validation docs", () => {
  it("documents the release-v1 web product and local runtime commands", () => {
    const readme = readFileSync("README.md", "utf8");
    const docs = readFileSync("docs/web-validation-console.md", "utf8");
    const architecture = readFileSync("ARCHITECTURE.md", "utf8");
    const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
      scripts?: Record<string, string>;
    };

    expect(readme).toContain("OpenClaw Release V1");
    expect(readme).toContain("pnpm start:release");
    expect(readme).toContain("pnpm dev:release");
    expect(readme).toContain("pnpm verify:release");
    expect(readme).toContain("pnpm test:e2e:release");
    expect(readme).toContain(".local/release-intake");
    expect(readme).toContain("apps/browser-extension");
    expect(readme).toContain("./docs/web-validation-console.md");
    expect(docs).toContain("家庭补货");
    expect(docs).toContain("办公室 / 小门店采购");
    expect(docs).toContain("演示模式");
    expect(docs).toContain("联调模式");
    expect(docs).toContain("/health");
    expect(docs).toContain("开始演示");
    expect(docs).toContain("pnpm start:release");
    expect(docs).toContain("pnpm dev:release");
    expect(docs).toContain("pnpm verify:release");
    expect(docs).toContain("pnpm test:e2e:release");
    expect(docs).toContain("POST /intents/replenish");
    expect(docs).toContain("feedback.jsonl");
    expect(docs).toContain("interest.jsonl");
    expect(architecture).toContain("OpenClaw Release V1 Architecture");
    expect(architecture).toContain("pnpm start:release");
    expect(architecture).toContain("pnpm verify:release");
    expect(packageJson.scripts?.["dev:web"]).toBe(
      "pnpm --dir apps/web dev --host 0.0.0.0 --port 4174 --strictPort",
    );
    expect(packageJson.scripts?.["preview:web"]).toBe(
      "pnpm --dir apps/web exec vite preview --host 0.0.0.0 --port 4174 --strictPort",
    );
    expect(packageJson.scripts?.["dev:release"]).toBe("tsx scripts/start-release.ts --mode=dev");
    expect(packageJson.scripts?.["start:release"]).toBe(
      "tsx scripts/start-release.ts --mode=preview",
    );
    expect(packageJson.scripts?.["dev:api"]).toBe("tsx apps/api/src/server.ts");
    expect(packageJson.scripts?.["dev:seller-sim"]).toBe("tsx apps/seller-sim/src/server.ts");
    expect(packageJson.scripts?.["test:e2e:release"]).toBe(
      "playwright test -c playwright.release.config.ts",
    );
    expect(packageJson.scripts?.verify).toBe("pnpm verify:release");
  });
});
