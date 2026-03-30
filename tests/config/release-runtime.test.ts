import { describe, expect, it } from "vitest";

import {
  RELEASE_API_PORT,
  RELEASE_SELLER_PORT,
  RELEASE_WEB_PORT,
  createReleaseServiceSpecs,
  parseReleaseMode,
} from "../../scripts/start-release.js";

describe("release runtime scripts", () => {
  it("builds a three-service local release stack", () => {
    const specs = createReleaseServiceSpecs("preview");

    expect(specs).toHaveLength(3);
    expect(specs.map((spec) => spec.name)).toEqual(["api", "seller-sim", "web"]);
    expect(specs[0]?.env.PORT).toBe(String(RELEASE_API_PORT));
    expect(specs[1]?.env.PORT).toBe(String(RELEASE_SELLER_PORT));
    expect(specs[2]?.args).toEqual(
      expect.arrayContaining(["--port", String(RELEASE_WEB_PORT), "--strictPort"]),
    );
    expect(specs[2]?.env.OPENCLAW_LIVE_API_TARGET).toBe(
      `http://127.0.0.1:${RELEASE_API_PORT}`,
    );
    expect(specs[2]?.env.OPENCLAW_LIVE_SELLER_TARGET).toBe(
      `http://127.0.0.1:${RELEASE_SELLER_PORT}`,
    );
  });

  it("supports preview and dev startup modes", () => {
    expect(parseReleaseMode(["--mode=preview"])).toBe("preview");
    expect(parseReleaseMode(["--mode=dev"])).toBe("dev");
    expect(() => parseReleaseMode(["--mode=unknown"])).toThrow(
      /unsupported_release_mode/,
    );
  });
});
