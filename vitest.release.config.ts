import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: [
      "tests/config/release-runtime.test.ts",
      "tests/config/release-verify.test.ts",
      "tests/config/web-docs.test.ts",
      "tests/config/web-proxy.test.ts",
      "tests/web/**/*.test.ts",
      "tests/web/**/*.test.tsx",
      "tests/architecture/**/*.test.ts",
      "tests/catalog/**/*.test.ts",
      "tests/checkout/**/*.test.ts",
      "tests/contract/**/*.test.ts",
      "tests/demand-planner/**/*.test.ts",
      "tests/fulfillment/**/*.test.ts",
      "tests/integration/intake.test.ts",
      "tests/integration/procurement-service.test.ts",
      "tests/integration/server-runtime.test.ts",
      "tests/memory/**/*.test.ts",
      "tests/offer-evaluator/**/*.test.ts",
      "tests/orchestrator/**/*.test.ts",
      "tests/policy-engine/**/*.test.ts",
      "tests/shared/**/*.test.ts",
      "tests/web/intake-forms.test.tsx",
      "tests/workspace/**/*.test.ts",
    ],
  },
});
