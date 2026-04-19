import { expect, test } from "@playwright/test";

test("runs the default demo scenario in the web validation console", async ({ page }) => {
  await page.goto("http://127.0.0.1:4174");
  await page.getByRole("button", { name: "开始演示" }).click();

  await expect(page.getByText("Demand")).toBeVisible();
  await expect(page.getByText("Explanation")).toBeVisible();
});
