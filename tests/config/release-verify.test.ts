import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("release verification contract", () => {
  it("defines release-specific typecheck and verify scripts around the web product", () => {
    const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
      scripts?: Record<string, string>;
    };
    const releaseTsconfig = JSON.parse(
      readFileSync("tsconfig.release.json", "utf8"),
    ) as {
      include?: string[];
      exclude?: string[];
    };

    expect(packageJson.scripts?.["typecheck:release"]).toBeTruthy();
    expect(packageJson.scripts?.["test:release"]).toBeTruthy();
    expect(packageJson.scripts?.["verify:release"]).toBeTruthy();
    expect(packageJson.scripts?.["dev:release"]).toBe("tsx scripts/start-release.ts --mode=dev");
    expect(packageJson.scripts?.["start:release"]).toBe(
      "tsx scripts/start-release.ts --mode=preview",
    );
    expect(packageJson.scripts?.["test:e2e:release"]).toBe(
      "playwright test -c playwright.release.config.ts",
    );
    expect(packageJson.scripts?.["verify:release"]).toContain("pnpm test:release");
    expect(packageJson.scripts?.verify).toBe("pnpm verify:release");

    expect(releaseTsconfig.include).toEqual(
      expect.arrayContaining([
        "apps/web/src/**/*.ts",
        "apps/web/src/**/*.tsx",
        "apps/api/src/**/*.ts",
        "apps/seller-sim/src/**/*.ts",
      ]),
    );
    expect(releaseTsconfig.exclude).toEqual(
      expect.arrayContaining([
        "apps/browser-extension/**",
        "tests/browser-extension/**",
      ]),
    );
  });
});
