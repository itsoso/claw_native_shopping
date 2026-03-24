import { expect, test } from "@playwright/test";

import {
  injectContentScript,
  installExtensionHarness,
} from "./helpers/extensionHarness";

test("shows the cart action on a JD cart fixture", async ({ page }) => {
  await installExtensionHarness(page);
  await page.goto("/tests/e2e/fixtures/jd-cart.html");
  await injectContentScript(page, "cart");

  await expect(
    page.getByRole("heading", { name: "再补 17.10 元可满 59 减 10。" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "应用建议" })).toBeVisible();
  await expect(page.getByRole("button", { name: "查看原因" })).toHaveCount(0);
});
