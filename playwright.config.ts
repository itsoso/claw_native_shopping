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
      // Fixture server for extension-level specs.
      command: `sh -c "pnpm --filter @claw/browser-extension build && python3 -m http.server ${FIXTURE_PORT} --bind 127.0.0.1"`,
      port: FIXTURE_PORT,
      cwd: ".",
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      // Web validation console — built once, served via Vite preview.
      command: `sh -c "pnpm build:web && pnpm --filter @claw/web preview --strictPort"`,
      port: WEB_PORT,
      cwd: ".",
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
