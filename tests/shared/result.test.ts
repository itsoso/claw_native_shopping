import { describe, expect, it } from "vitest";
import { err, ok } from "../../packages/shared/src/result.js";

describe("result helpers", () => {
  it("creates ok results", () => {
    expect(ok(1)).toEqual({ ok: true, value: 1 });
  });

  it("creates err results", () => {
    expect(err("x")).toEqual({ ok: false, error: "x" });
  });
});
