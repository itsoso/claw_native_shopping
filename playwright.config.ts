import { defineConfig } from "@playwright/test";

const PORT = 4173;

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    headless: true,
  },
  webServer: {
    command: `sh -c "pnpm --filter @claw/browser-extension build && python3 -m http.server ${PORT} --bind 127.0.0.1"`,
    port: PORT,
    cwd: ".",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
