import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import playwrightConfig, {
  buildWebServers,
  WEB_E2E_API_PORT,
  WEB_E2E_SELLER_PORT,
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
      shouldStartWebPreview(["node", "playwright", "test", "--workers", "1"]),
    ).toBe(true);
    expect(
      shouldStartWebPreview(["node", "playwright", "test", "tests/e2e"]),
    ).toBe(true);

    expect(
      shouldStartWebPreview([
        "node",
        "playwright",
        "test",
        "tests/e2e/product-page.spec.ts",
      ]),
    ).toBe(false);
    expect(
      shouldStartWebPreview([
        "node",
        "playwright",
        "test",
        "tests/e2e/product-page.spec.ts",
        "--workers",
        "1",
      ]),
    ).toBe(false);
    expect(
      shouldStartWebPreview([
        "node",
        "playwright",
        "test",
        "tests/e2e/product-page.spec.ts:5",
      ]),
    ).toBe(false);
    expect(
      shouldStartWebPreview([
        "node",
        "playwright",
        "test",
        "C:\\repo\\tests\\e2e\\product-page.spec.ts:5",
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
        "web-validation-console.spec.ts",
        "--workers",
        "1",
      ]),
    ).toBe(true);
    expect(
      shouldStartWebPreview([
        "node",
        "playwright",
        "test",
        "tests/e2e/web-validation-console.spec.ts:5",
      ]),
    ).toBe(true);
    expect(
      shouldStartWebPreview([
        "node",
        "playwright",
        "test",
        "tests/e2e/web-validation-console.spec.ts:5:9",
      ]),
    ).toBe(true);
    expect(
      shouldStartWebPreview([
        "node",
        "playwright",
        "test",
        "tests/e2e/product-page.spec.ts",
        "web-validation-console.spec.ts",
      ]),
    ).toBe(true);
    expect(
      shouldStartWebPreview([
        "node",
        "playwright",
        "test",
        "tests/e2e/web-validation-console.spec.ts",
      ]),
    ).toBe(true);
    expect(
      shouldStartWebPreview([
        "node",
        "playwright",
        "test",
        "C:\\repo\\tests\\e2e\\web-validation-console.spec.ts",
      ]),
    ).toBe(true);

    const webServers = buildWebServers([
      "node",
      "playwright",
      "test",
      "tests/e2e/web-validation-console.spec.ts",
    ]);
    const previewServer = webServers.find((server) => server?.name === "Web Preview");
    const apiServer = webServers.find((server) => server?.name === "Buyer API");
    const sellerServer = webServers.find((server) => server?.name === "Seller Sim");

    expect(previewServer).toBeDefined();
    expect(apiServer).toBeDefined();
    expect(sellerServer).toBeDefined();
    expect(apiServer?.port).toBe(WEB_E2E_API_PORT);
    expect(sellerServer?.port).toBe(WEB_E2E_SELLER_PORT);
    expect(apiServer?.command).toContain(`PORT=${WEB_E2E_API_PORT}`);
    expect(sellerServer?.command).toContain(`PORT=${WEB_E2E_SELLER_PORT}`);
    expect(previewServer?.command).toContain(
      `OPENCLAW_LIVE_API_TARGET=http://127.0.0.1:${WEB_E2E_API_PORT}`,
    );
    expect(previewServer?.command).toContain(
      `OPENCLAW_LIVE_SELLER_TARGET=http://127.0.0.1:${WEB_E2E_SELLER_PORT}`,
    );
    expect(apiServer?.reuseExistingServer).toBe(false);
    expect(sellerServer?.reuseExistingServer).toBe(false);
    expect(previewServer?.reuseExistingServer).toBe(false);
  });

  it("keeps Playwright responsible for the browser-extension build", () => {
    const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
      scripts?: Record<string, string>;
    };
    const e2eScript = packageJson.scripts?.["test:e2e"] ?? "";

    expect(e2eScript).toBe("playwright test");
    expect(e2eScript).not.toContain("@claw/browser-extension build");
  });
});
