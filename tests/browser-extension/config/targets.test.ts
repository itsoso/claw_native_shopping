import { describe, expect, it } from "vitest";
import { JD_CART_URL, JD_ITEM_URL } from "../../../apps/browser-extension/src/config/targets";

describe("browser extension targets", () => {
  it("locks the MVP to JD item and cart pages", () => {
    expect(JD_ITEM_URL).toBe("https://item.jd.com/*");
    expect(JD_CART_URL).toBe("https://cart.jd.com/*");
  });
});
