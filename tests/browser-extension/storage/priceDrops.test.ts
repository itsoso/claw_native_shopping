import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { shouldNotify } from "../../../apps/browser-extension/src/storage/priceDrops.js";
import type { PriceDrop } from "../../../apps/browser-extension/src/types/priceDrop.js";
import { REPEAT_NOTIFY_GROWTH_RATIO } from "../../../apps/browser-extension/src/types/priceDrop.js";
import { PRICE_GUARD_WINDOW_DAYS } from "../../../apps/browser-extension/src/types/purchasedProduct.js";

const browserContext = vi.hoisted(() => {
  const storageState = new Map<string, unknown>();

  const area = {
    get: vi.fn(async (key?: string | string[]) => {
      if (key == null) return Object.fromEntries(storageState.entries());
      if (Array.isArray(key)) {
        return Object.fromEntries(key.map((k) => [k, storageState.get(k)]));
      }
      return { [key]: storageState.get(key) };
    }),
    set: vi.fn(async (values: Record<string, unknown>) => {
      Object.entries(values).forEach(([k, v]) => storageState.set(k, v));
    }),
    remove: vi.fn(async (key: string | string[]) => {
      [key].flat().forEach((k) => storageState.delete(k));
    }),
    clear: vi.fn(async () => {
      storageState.clear();
    }),
    onChanged: { addListener: vi.fn(), removeListener: vi.fn() },
  };

  const globalBrowser = globalThis as typeof globalThis & {
    browser?: unknown;
    chrome?: unknown;
  };
  const originalBrowser = globalBrowser.browser;
  const originalChrome = globalBrowser.chrome;

  globalBrowser.browser = {
    runtime: { id: "openclaw-test" },
    storage: { local: area, session: area, sync: area, managed: area },
  };
  globalBrowser.chrome = undefined;

  return { area, storageState, originalBrowser, originalChrome };
});

async function loadModule() {
  vi.resetModules();
  return import(
    "../../../apps/browser-extension/src/storage/priceDrops.js"
  );
}

const BASE_INPUT = {
  skuId: "100001",
  title: "立白 洗衣液 2kg",
  paidPrice: 100,
  currentPrice: 80,
  droppedBy: 20,
  url: "https://item.jd.com/100001.html",
  sellerType: "self_operated" as const,
};

describe("priceDrops storage", () => {
  beforeEach(() => {
    browserContext.storageState.clear();
    browserContext.area.get.mockClear();
    browserContext.area.set.mockClear();
    vi.restoreAllMocks();
  });

  it("upserts a new drop and reads it back", async () => {
    const { upsertPriceDrop, readPriceDrops } = await loadModule();
    vi.spyOn(Date, "now").mockReturnValue(1000);

    await upsertPriceDrop(BASE_INPUT);

    const drops = await readPriceDrops();
    expect(drops).toHaveLength(1);
    expect(drops[0]).toMatchObject({
      skuId: "100001",
      droppedBy: 20,
      detectedAt: 1000,
    });
    expect(drops[0]!.dismissedAt).toBeUndefined();
  });

  it("preserves dismissedAt and lastNotifiedDropBy on re-upsert", async () => {
    const { upsertPriceDrop, dismissPriceDrop, markPriceDropNotified, readPriceDrops } =
      await loadModule();

    vi.spyOn(Date, "now")
      .mockReturnValueOnce(1000) // initial upsert
      .mockReturnValueOnce(2000) // dismiss (uses Date.now)
      .mockReturnValueOnce(3000); // re-upsert (markNotified does not call Date.now)

    await upsertPriceDrop(BASE_INPUT);
    await dismissPriceDrop("100001");
    await markPriceDropNotified("100001", 18);

    await upsertPriceDrop({ ...BASE_INPUT, currentPrice: 75, droppedBy: 25 });

    const drops = await readPriceDrops();
    expect(drops[0]!.detectedAt).toBe(3000);
    expect(drops[0]!.droppedBy).toBe(25);
    expect(drops[0]!.dismissedAt).toBe(2000);
    expect(drops[0]!.lastNotifiedDropBy).toBe(18);
  });

  it("readActivePriceDrops filters out stale and dismissed entries", async () => {
    const { upsertPriceDrop, dismissPriceDrop, readActivePriceDrops } =
      await loadModule();

    const now = 10_000_000_000;
    const dayMs = 24 * 60 * 60 * 1000;

    vi.spyOn(Date, "now").mockReturnValueOnce(now - 45 * dayMs);
    await upsertPriceDrop({ ...BASE_INPUT, skuId: "stale" });

    vi.spyOn(Date, "now").mockReturnValueOnce(now - 5 * dayMs);
    await upsertPriceDrop({ ...BASE_INPUT, skuId: "fresh" });

    vi.spyOn(Date, "now").mockReturnValueOnce(now - 2 * dayMs);
    await upsertPriceDrop({ ...BASE_INPUT, skuId: "dismissed" });
    vi.spyOn(Date, "now").mockReturnValueOnce(now - 1 * dayMs);
    await dismissPriceDrop("dismissed");

    const active = await readActivePriceDrops(now);
    expect(active.map((d) => d.skuId)).toEqual(["fresh"]);
    expect(PRICE_GUARD_WINDOW_DAYS).toBe(30);
  });

  it("caps storage at 100 entries", async () => {
    const { upsertPriceDrop, readPriceDrops } = await loadModule();

    let t = 1000;
    vi.spyOn(Date, "now").mockImplementation(() => t++);

    for (let i = 0; i < 105; i++) {
      await upsertPriceDrop({ ...BASE_INPUT, skuId: `sku-${i}` });
    }

    const drops = await readPriceDrops();
    expect(drops).toHaveLength(100);
    expect(drops[0]!.skuId).toBe("sku-104");
  });

  it("clearPriceDrops empties the list", async () => {
    const { upsertPriceDrop, clearPriceDrops, readPriceDrops } = await loadModule();
    vi.spyOn(Date, "now").mockReturnValue(1000);

    await upsertPriceDrop(BASE_INPUT);
    await clearPriceDrops();

    expect(await readPriceDrops()).toEqual([]);
  });

  it("returns empty array when storage is empty", async () => {
    const { readPriceDrops, readActivePriceDrops } = await loadModule();
    expect(await readPriceDrops()).toEqual([]);
    expect(await readActivePriceDrops()).toEqual([]);
  });
});

describe("shouldNotify", () => {
  function makeDrop(over: Partial<PriceDrop> = {}): PriceDrop {
    return {
      skuId: "1",
      title: "x",
      paidPrice: 100,
      currentPrice: 80,
      droppedBy: 20,
      url: "",
      sellerType: "self_operated",
      detectedAt: 1000,
      ...over,
    };
  }

  it("notifies on first detection", () => {
    expect(shouldNotify(makeDrop(), 20)).toBe(true);
  });

  it("does not notify a dismissed drop", () => {
    expect(shouldNotify(makeDrop({ dismissedAt: 2000 }), 25)).toBe(false);
  });

  it("does not notify when growth is below the ratio", () => {
    // last notified at 20; new is 22 (1.1×) — below 1.2×
    expect(shouldNotify(makeDrop({ lastNotifiedDropBy: 20 }), 22)).toBe(false);
  });

  it("re-notifies when drop grows past the ratio", () => {
    // 20 × 1.2 = 24; new is 24 → exactly at threshold, allowed
    expect(shouldNotify(makeDrop({ lastNotifiedDropBy: 20 }), 24)).toBe(true);
    expect(REPEAT_NOTIFY_GROWTH_RATIO).toBe(1.2);
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
