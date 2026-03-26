import { defineConfig } from "@playwright/test";

const FIXTURE_PORT = 4173;
const WEB_PORT = 4174;

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: `http://127.0.0.1:${FIXTURE_PORT}`,
    headless: true,
  },
  webServer: [
    {
      command: "python3 -m http.server 4173 --bind 127.0.0.1 --directory .",
      name: "Fixture Server",
      port: FIXTURE_PORT,
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: "pnpm preview:web:e2e",
      name: "Web Preview",
      port: WEB_PORT,
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
