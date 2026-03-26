import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import playwrightConfig, {
  buildWebServers,
  shouldStartWebPreview,
} from "../../playwright.config.ts";

describe("playwright e2e harness", () => {
  it("only starts the web preview server when the web console spec is selected", async () => {
    expect(playwrightConfig.globalSetup).toBe("./tests/e2e/globalSetup.ts");
    expect(playwrightConfig.testMatch).toBe("**/*.spec.ts");

    expect(
      shouldStartWebPreview(["node", "playwright", "test"]),
    ).toBe(true);

    expect(
      shouldStartWebPreview([
        "node",
        "playwright",
        "test",
        "tests/e2e/product-page.spec.ts",
      ]),
    ).toBe(false);

    const productServers = buildWebServers([
      "node",
      "playwright",
      "test",
      "tests/e2e/product-page.spec.ts",
    ]);
    expect(productServers.map((server) => server?.name)).not.toContain("Web Preview");

    expect(
      shouldStartWebPreview([
        "node",
        "playwright",
        "test",
        "tests/e2e/web-validation-console.spec.ts",
      ]),
    ).toBe(true);

    const webServers = buildWebServers([
      "node",
      "playwright",
      "test",
      "tests/e2e/web-validation-console.spec.ts",
    ]);
    const previewServer = webServers.find((server) => server?.name === "Web Preview");

    expect(previewServer).toBeDefined();
    expect(previewServer?.reuseExistingServer).toBe(false);
  });

  it("keeps Playwright responsible for the browser-extension build", () => {
    const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
      scripts?: Record<string, string>;
    };
    const e2eScript = packageJson.scripts?.["test:e2e"] ?? "";

    expect(e2eScript).toContain("playwright test");
    expect(e2eScript).not.toContain("@claw/browser-extension build");
  });
});
