import { expect, test } from "@playwright/test";

import {
  injectContentScript,
  installExtensionHarness,
} from "./helpers/extensionHarness";

test("shows the decision card on a JD product fixture", async ({ page }) => {
  await installExtensionHarness(page);
  await page.goto("/tests/e2e/fixtures/jd-product.html");
  await injectContentScript(page, "product-page");

  await expect(
    page.getByRole("heading", { name: "保留当前商品：立白 洗衣液 2kg" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "应用建议" })).toBeVisible();
  await expect(page.getByRole("button", { name: "查看原因" })).toBeVisible();
});
