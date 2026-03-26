import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { chromium, expect, test } from "@playwright/test";

const extensionPath = resolve(
  process.cwd(),
  "apps/browser-extension/.output/chrome-mv3",
);

async function launchExtensionContext() {
  return chromium.launchPersistentContext("", {
    channel: "chromium",
    headless: true,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });
}

test("loads the unpacked extension and injects on a JD product URL", async () => {
  const context = await launchExtensionContext();

  const page = await context.newPage();
  const productFixture = readFileSync(
    "tests/e2e/fixtures/jd-product.html",
    "utf8",
  );

  await page.route("https://item.jd.com/*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/html; charset=utf-8",
      body: productFixture,
    });
  });

  await page.goto("https://item.jd.com/100001.html");

  await expect(
    page.getByRole("heading", { name: "保留当前商品：立白 洗衣液 2kg" }),
  ).toBeVisible();

  await context.close();
});

test("loads the unpacked extension and injects on a JD cart URL", async () => {
  const context = await launchExtensionContext();

  const page = await context.newPage();
  const cartFixture = readFileSync(
    "tests/e2e/fixtures/jd-cart.html",
    "utf8",
  );

  await page.route("https://cart.jd.com/*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/html; charset=utf-8",
      body: cartFixture,
    });
  });

  await page.goto("https://cart.jd.com/cart_index");

  await expect(
    page.getByRole("heading", { name: "再补 17.10 元可满 59 减 10。" }),
  ).toBeVisible();

  await context.close();
});
