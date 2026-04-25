import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { checkPriceDrop } from "../../../apps/browser-extension/src/storage/purchasedProducts.js";
import {
  MIN_DROP_AMOUNT,
  PRICE_DROP_RATIO,
  PRICE_GUARD_WINDOW_DAYS,
} from "../../../apps/browser-extension/src/types/purchasedProduct.js";

const browserContext = vi.hoisted(() => {
  const storageState = new Map<string, unknown>();

  const area = {
    get: vi.fn(async (key?: string | string[]) => {
      if (key == null) {
        return Object.fromEntries(storageState.entries());
      }

      if (Array.isArray(key)) {
        return Object.fromEntries(
          key.map((entry) => [entry, storageState.get(entry)]),
        );
      }

      return { [key]: storageState.get(key) };
    }),
    set: vi.fn(async (values: Record<string, unknown>) => {
      Object.entries(values).forEach(([key, value]) => {
        storageState.set(key, value);
      });
    }),
    remove: vi.fn(async (key: string | string[]) => {
      [key].flat().forEach((entry) => {
        storageState.delete(entry);
      });
    }),
    clear: vi.fn(async () => {
      storageState.clear();
    }),
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  };

  const globalBrowser = globalThis as typeof globalThis & {
    browser?: unknown;
    chrome?: unknown;
  };

  const originalBrowser = globalBrowser.browser;
  const originalChrome = globalBrowser.chrome;

  globalBrowser.browser = {
    runtime: { id: "openclaw-test" },
    storage: {
      local: area,
      session: area,
      sync: area,
      managed: area,
    },
  };
  globalBrowser.chrome = undefined;

  return {
    area,
    storageState,
    originalBrowser,
    originalChrome,
  };
});

async function loadModule() {
  vi.resetModules();
  return import(
    "../../../apps/browser-extension/src/storage/purchasedProducts.js"
  );
}

describe("purchasedProducts storage", () => {
  beforeEach(() => {
    browserContext.storageState.clear();
    browserContext.area.get.mockClear();
    browserContext.area.set.mockClear();
    vi.restoreAllMocks();
  });

  it("records a purchase and reads it back", async () => {
    const { readPurchasedProducts, markPurchased } = await loadModule();

    vi.spyOn(Date, "now").mockReturnValue(1000);

    await markPurchased({
      skuId: "100001",
      title: "立白 洗衣液 2kg",
      paidPrice: 29.9,
      sellerType: "self_operated",
      url: "https://item.jd.com/100001.html",
    });

    const purchases = await readPurchasedProducts();
    expect(purchases.length).toBe(1);
    expect(purchases[0]).toEqual({
      skuId: "100001",
      title: "立白 洗衣液 2kg",
      paidPrice: 29.9,
      sellerType: "self_operated",
      url: "https://item.jd.com/100001.html",
      purchasedAt: 1000,
    });
  });

  it("upserts by skuId — refreshes purchasedAt and paidPrice", async () => {
    const { readPurchasedProducts, markPurchased } = await loadModule();

    vi.spyOn(Date, "now")
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(2000);

    await markPurchased({
      skuId: "100001",
      title: "Product A",
      paidPrice: 29.9,
      sellerType: "marketplace",
      url: "https://item.jd.com/100001.html",
    });

    await markPurchased({
      skuId: "100001",
      title: "Product A",
      paidPrice: 25.0,
      sellerType: "self_operated",
      url: "https://item.jd.com/100001.html",
    });

    const purchases = await readPurchasedProducts();
    expect(purchases.length).toBe(1);
    expect(purchases[0]!.paidPrice).toBe(25.0);
    expect(purchases[0]!.purchasedAt).toBe(2000);
  });

  it("caps at 100 entries, evicting oldest", async () => {
    const { readPurchasedProducts, markPurchased } = await loadModule();

    let time = 1000;
    vi.spyOn(Date, "now").mockImplementation(() => time++);

    for (let i = 0; i < 105; i++) {
      await markPurchased({
        skuId: `sku-${i}`,
        title: `Product ${i}`,
        paidPrice: 10 + i,
        sellerType: "marketplace",
        url: `https://item.jd.com/${i}.html`,
      });
    }

    const purchases = await readPurchasedProducts();
    expect(purchases.length).toBe(100);
    expect(purchases[0]!.skuId).toBe("sku-104");
    expect(purchases[99]!.skuId).toBe("sku-5");
  });

  it("readActivePurchases filters out records older than the guard window", async () => {
    const { readActivePurchases, markPurchased } = await loadModule();

    const now = 10_000_000_000;
    const dayMs = 24 * 60 * 60 * 1000;

    vi.spyOn(Date, "now").mockReturnValueOnce(now - 45 * dayMs); // stale
    await markPurchased({
      skuId: "old",
      title: "Old purchase",
      paidPrice: 50,
      sellerType: "self_operated",
      url: "https://item.jd.com/old.html",
    });

    vi.spyOn(Date, "now").mockReturnValueOnce(now - 5 * dayMs); // fresh
    await markPurchased({
      skuId: "fresh",
      title: "Fresh purchase",
      paidPrice: 60,
      sellerType: "self_operated",
      url: "https://item.jd.com/fresh.html",
    });

    const active = await readActivePurchases(now);
    expect(active.map((p) => p.skuId)).toEqual(["fresh"]);
    // Guard window matches the exported constant
    expect(PRICE_GUARD_WINDOW_DAYS).toBe(30);
  });

  it("clearPurchasedProducts empties the list", async () => {
    const { readPurchasedProducts, markPurchased, clearPurchasedProducts } =
      await loadModule();

    vi.spyOn(Date, "now").mockReturnValue(1000);

    await markPurchased({
      skuId: "100001",
      title: "Product",
      paidPrice: 10,
      sellerType: "marketplace",
      url: "https://item.jd.com/100001.html",
    });

    await clearPurchasedProducts();

    const purchases = await readPurchasedProducts();
    expect(purchases).toEqual([]);
  });

  it("returns empty array when storage is empty", async () => {
    const { readPurchasedProducts } = await loadModule();
    expect(await readPurchasedProducts()).toEqual([]);
  });
});

describe("checkPriceDrop", () => {
  const purchased = {
    skuId: "100001",
    title: "Product",
    paidPrice: 100,
    sellerType: "self_operated" as const,
    url: "https://item.jd.com/100001.html",
    purchasedAt: 1000,
  };

  it("triggers a drop when current price is at least 5% below paid and ≥ ¥1", () => {
    const result = checkPriceDrop(purchased, 90);
    expect(result).toEqual({
      skuId: "100001",
      title: "Product",
      paidPrice: 100,
      currentPrice: 90,
      droppedBy: 10,
      url: "https://item.jd.com/100001.html",
    });
  });

  it("does not trigger when current is within 5% of paid", () => {
    // 96 → 4% drop, ratio cutoff is 5%
    expect(checkPriceDrop(purchased, 96)).toBeNull();
    expect(PRICE_DROP_RATIO).toBe(0.95);
  });

  it("does not trigger when absolute drop is below MIN_DROP_AMOUNT", () => {
    // paid ¥5 → 5% would be ¥0.25, absolute below ¥1
    const cheap = { ...purchased, paidPrice: 5 };
    expect(checkPriceDrop(cheap, 4.5)).toBeNull();
    expect(MIN_DROP_AMOUNT).toBe(1);
  });

  it("does not trigger when current >= paid", () => {
    expect(checkPriceDrop(purchased, 100)).toBeNull();
    expect(checkPriceDrop(purchased, 110)).toBeNull();
  });

  it("returns null for non-positive or non-finite current prices", () => {
    expect(checkPriceDrop(purchased, 0)).toBeNull();
    expect(checkPriceDrop(purchased, -5)).toBeNull();
    expect(checkPriceDrop(purchased, Number.NaN)).toBeNull();
  });

  it("triggers exactly at the 5% boundary", () => {
    // 95 is exactly paid × 0.95 → allowed
    const r = checkPriceDrop(purchased, 95);
    expect(r).not.toBeNull();
    expect(r!.droppedBy).toBe(5);
  });
});

afterAll(() => {
  const globalBrowser = globalThis as typeof globalThis & {
    browser?: unknown;
    chrome?: unknown;
  };

  globalBrowser.browser = browserContext.originalBrowser;
  globalBrowser.chrome = browserContext.originalChrome;
});
