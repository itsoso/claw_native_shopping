import { expect, test } from "@playwright/test";

test.use({ baseURL: "http://127.0.0.1:4174" });

test("runs the default demo scenario in the web validation console", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("button", { name: "开始演示" })).toBeVisible();
  await expect(page.getByText("Runtime State", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "开始演示" }).click();

  await expect(page.getByText("Flow Timeline", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Demand" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Explanation" })).toBeVisible();
  await expect(page.getByText("Demo", { exact: true })).toBeVisible();
  await expect(page.getByText("demo runtime active", { exact: true }).first()).toBeVisible();
});
