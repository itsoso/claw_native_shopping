import { defineConfig } from "@playwright/test";

const FIXTURE_PORT = 4173;
const WEB_PORT = 4174;
const WEB_SPEC_PATH = "tests/e2e/web-validation-console.spec.ts";

const buildFixtureServer = () => ({
  command: `python3 -m http.server ${FIXTURE_PORT} --bind 127.0.0.1 --directory .`,
  name: "Fixture Server",
  port: FIXTURE_PORT,
  reuseExistingServer: true,
  timeout: 120_000,
});

const buildWebPreviewServer = () => ({
  command: "pnpm preview:web:e2e",
  name: "Web Preview",
  port: WEB_PORT,
  reuseExistingServer: false,
  timeout: 120_000,
});

export const shouldStartWebPreview = (
  argv: readonly string[] = process.argv,
): boolean => {
  const cliArgs = argv
    .slice(2)
    .filter(
      (value) =>
        value.length > 0 &&
        !value.startsWith("-") &&
        value !== "test",
    );

  if (cliArgs.length === 0) {
    return true;
  }

  return cliArgs.some((value) => value.includes(WEB_SPEC_PATH));
};

export const buildWebServers = (
  argv: readonly string[] = process.argv,
) => {
  const servers = [buildFixtureServer()];

  if (shouldStartWebPreview(argv)) {
    servers.push(buildWebPreviewServer());
  }

  return servers;
};

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.spec.ts",
  globalSetup: "./tests/e2e/globalSetup.ts",
  use: {
    baseURL: `http://127.0.0.1:${FIXTURE_PORT}`,
    headless: true,
  },
  webServer: buildWebServers(),
});
