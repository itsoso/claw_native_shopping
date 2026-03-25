import { defineConfig } from "@playwright/test";

const PORT = 4173;

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    headless: true,
  },
  webServer: [
    {
      command: "pnpm start:api",
      port: 3000,
      cwd: ".",
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: "pnpm start:web",
      port: 4174,
      cwd: ".",
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: `sh -c "pnpm --filter @claw/browser-extension build && python3 -m http.server ${PORT} --bind 127.0.0.1"`,
      port: PORT,
      cwd: ".",
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
