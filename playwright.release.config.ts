import { defineConfig } from "@playwright/test";

const RELEASE_WEB_PORT = 4374;
const RELEASE_API_PORT = 4400;
const RELEASE_SELLER_PORT = 4401;

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "web-validation-console.spec.ts",
  use: {
    baseURL: `http://127.0.0.1:${RELEASE_WEB_PORT}`,
    headless: true,
  },
  webServer: {
    command:
      `OPENCLAW_RELEASE_WEB_PORT=${RELEASE_WEB_PORT} ` +
      `OPENCLAW_RELEASE_API_PORT=${RELEASE_API_PORT} ` +
      `OPENCLAW_RELEASE_SELLER_PORT=${RELEASE_SELLER_PORT} ` +
      "pnpm start:release",
    url: `http://127.0.0.1:${RELEASE_WEB_PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
