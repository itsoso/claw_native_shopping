import { expect, test } from "@playwright/test";

test("runs the household-first web demo and lets users inspect the order path", async ({
  page
}) => {
  await page.goto("http://127.0.0.1:4174");

  await expect(
    page.getByRole("heading", { name: "你的冰箱正在等待下一次自动补货" })
  ).toBeVisible();
  await expect(
    page.getByRole("tab", { name: "家庭冰箱补货", selected: true })
  ).toBeVisible();

  await page.getByRole("button", { name: "为这个家发起自动补货" }).click();

  await expect(page.getByText("已为你的家庭提交一笔补货订单")).toBeVisible();
  await expect(page.getByText("需求已生成")).toBeVisible();
  await expect(page.getByText("订单已提交")).toBeVisible();

  await page.getByRole("button", { name: "查看订单解释" }).click();
  const drawer = page.getByRole("complementary");
  await expect(drawer.getByText("为什么是这笔订单")).toBeVisible();
  await expect(drawer.getByText("ORDER_COMMITTED")).toBeVisible();

  await page.getByRole("tab", { name: "办公室 / 门店补货" }).click();
  await expect(page.getByRole("heading", { name: "咖啡豆" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "为办公室发起自动补货" })
  ).toBeVisible();
});

test("shows startup guidance when the buyer api is unreachable", async ({ page }) => {
  await page.route("http://127.0.0.1:3000/intents/replenish", (route) => {
    void route.abort();
  });

  await page.goto("http://127.0.0.1:4174");
  await page.getByRole("button", { name: "为这个家发起自动补货" }).click();

  await expect(page.getByText(/buyer API 未启动/)).toBeVisible();
});
