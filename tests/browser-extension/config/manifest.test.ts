import { describe, expect, it } from "vitest";

import config from "../../../apps/browser-extension/wxt.config.js";

describe("browser extension manifest", () => {
  it("declares the storage permission required by local-first preferences and events", () => {
    expect(config.manifest?.permissions).toContain("storage");
  });
});
