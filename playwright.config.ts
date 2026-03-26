import { defineConfig } from "@playwright/test";

const PORT = 4173;

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    headless: true,
  },
  webServer: {
    command: "pnpm serve:e2e",
    port: 4174,
    cwd: ".",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
