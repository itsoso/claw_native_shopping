import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("web runtime config", () => {
  it("binds the demo web server to 0.0.0.0 so localhost works consistently", () => {
    const packageJson = JSON.parse(
      readFileSync(
        "/Users/liqiuhua/.config/superpowers/worktrees/claw_native_kshop/codex-web-demo-product/apps/web/package.json",
        "utf8"
      )
    ) as {
      scripts: Record<string, string>;
    };

    expect(packageJson.scripts.dev).toContain("--host 0.0.0.0");
    expect(packageJson.scripts.start).toContain("--host 0.0.0.0");
    expect(packageJson.scripts.preview).toContain("--host 0.0.0.0");
  });
});
