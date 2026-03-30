import { expect, test } from "@playwright/test";

test("runs the default demo scenario in the web validation console", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("button", { name: "开始演示" })).toBeVisible();
  await expect(page.getByText("当前路径", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "开始演示" }).click();

  await expect(page.getByText("决策时间线", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "需求触发" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "决策解释" })).toBeVisible();
  await expect(page.getByText("当前路径", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "演示模式" })).toBeVisible();
  await expect(page.getByText("演示路径已激活", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "留下反馈" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "加入候补" })).toBeVisible();
});

test("runs the live scenario in the web validation console", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "更划算" }).click();
  await page.getByRole("button", { name: /冷链牛奶时效与价格权衡/i }).click();
  await page.getByRole("button", { name: "联调模式" }).click();
  await page.getByRole("button", { name: "开始演示" }).click();

  await expect(page.getByText("当前路径", { exact: true })).toBeVisible();
  await expect(page.locator(".runtime-summary strong")).toHaveText("联调模式");
  await expect(page.locator(".health-card").filter({ hasText: "Buyer API" })).toContainText(
    "健康",
  );
  await expect(page.locator(".health-card").filter({ hasText: "Seller Sim" })).toContainText(
    "健康",
  );
  await expect(page.getByRole("heading", { name: "卖家执行" })).toBeVisible();
  await expect(
    page.getByText(/seller-sim 已返回 2 个排序报价/i),
  ).toBeVisible();
  await expect(
    page.getByText(/已比较 2 个卖家候选/i),
  ).toBeVisible();
  await expect(page.getByText(/冷链牛奶补货/i)).toBeVisible();
  await expect(page.getByText(/预算上限为 45/i)).toBeVisible();
  await expect(page.getByText("服务不可用，已切回演示模式。")).toHaveCount(0);
});
