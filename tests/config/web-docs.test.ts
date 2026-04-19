import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("web validation docs", () => {
  it("documents how to run the web console in demo and live mode", () => {
    const readme = readFileSync("README.md", "utf8");
    const docs = readFileSync("docs/web-validation-console.md", "utf8");

    expect(readme).toContain("pnpm dev:web");
    expect(readme).toContain("OpenClaw Web Validation Console");
    expect(docs).toContain("Demo");
    expect(docs).toContain("Live");
    expect(docs).toContain("/health");
  });
});
