import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("operator docs", () => {
  it("documents how to run the JD shopping copilot MVP", () => {
    const readme = readFileSync("README.md", "utf8");
    const checklist = readFileSync("docs/mvp-validation-checklist.md", "utf8");
    const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
      scripts?: Record<string, string>;
    };

    expect(readme).toContain("pnpm dev");
    expect(readme).toContain("pnpm build");
    expect(readme).toContain("京东");
    expect(readme).toContain("Chrome");
    expect(readme).toContain("chrome://extensions");
    expect(readme).toContain("Load unpacked");
    expect(readme).toContain("(docs/mvp-validation-checklist.md)");
    expect(checklist).toContain("recommendation acceptance rate");
    expect(checklist).toContain("cart plan application rate");
    expect(checklist).toContain("weekly repeat usage");
    expect(checklist).toContain("recommendation_shown");
    expect(checklist).toContain("recommendation_applied");
    expect(checklist).toContain("reason_viewed");
    expect(checklist).toContain("preference_changed");
    expect(checklist).toContain("cart_plan_applied");
    expect(checklist).toContain("accepted recommendation events / shown recommendation events");
    expect(checklist).toContain("cart plan applied events / cart plan shown events");
    expect(packageJson.scripts?.build).toBeTruthy();
    expect(packageJson.scripts?.["test:e2e"]).toBeTruthy();
  });
});
