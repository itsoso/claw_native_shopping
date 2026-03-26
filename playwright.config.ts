import { defineConfig } from "@playwright/test";

const FIXTURE_PORT = 4173;
const WEB_PORT = 4174;
const WEB_SPEC_FILENAME = "web-validation-console.spec.ts";
const PLAYWRIGHT_OPTIONS_WITH_VALUE = new Set([
  "--browser",
  "--config",
  "-c",
  "--global-timeout",
  "--grep",
  "-g",
  "--grep-invert",
  "--max-failures",
  "--output",
  "--project",
  "--repeat-each",
  "--reporter",
  "--retries",
  "--shard",
  "--timeout",
  "--trace",
  "--ui-port",
  "--workers",
  "-j",
]);

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

const normalizeSelector = (value: string): string => value.split(":")[0] ?? value;

export const shouldStartWebPreview = (
  argv: readonly string[] = process.argv,
): boolean => {
  const selectors: string[] = [];
  let skipNextValue = false;

  for (const value of argv.slice(2)) {
    if (skipNextValue) {
      skipNextValue = false;
      continue;
    }

    if (value === "test") {
      continue;
    }

    if (PLAYWRIGHT_OPTIONS_WITH_VALUE.has(value)) {
      skipNextValue = true;
      continue;
    }

    if (value.startsWith("-")) {
      continue;
    }

    selectors.push(value);
  }

  if (selectors.length === 0) {
    return true;
  }

  if (
    selectors.some((value) =>
      normalizeSelector(value).endsWith(WEB_SPEC_FILENAME),
    )
  ) {
    return true;
  }

  return selectors.some((value) => !value.endsWith(".spec.ts"));
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
