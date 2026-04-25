import { beforeEach, describe, expect, it, vi } from "vitest";

const storageMocks = vi.hoisted(() => ({
  readActivePurchases: vi.fn(),
}));

const dropsMocks = vi.hoisted(() => ({
  upsertPriceDrop: vi.fn(),
  markPriceDropNotified: vi.fn(),
  shouldNotify: vi.fn(),
}));

const priceMocks = vi.hoisted(() => ({
  fetchPriceHistoryBatch: vi.fn(),
}));

const browserMock = vi.hoisted(() => {
  const notifications = {
    create: vi.fn().mockResolvedValue(undefined),
  };
  const tabs = {
    create: vi.fn().mockResolvedValue(undefined),
  };
  const runtime = {
    getURL: vi.fn((p: string) => `chrome-extension://id/${p}`),
  };
  (globalThis as unknown as Record<string, unknown>).browser = {
    notifications,
    tabs,
    runtime,
  };
  return { notifications, tabs };
});

vi.mock(
  "../../../apps/browser-extension/src/storage/purchasedProducts.js",
  async () => {
    // Keep the real `checkPriceDrop` pure function so notification content
    // reflects the real math; only `readActivePurchases` is mocked.
    const actual = await vi.importActual<
      typeof import("../../../apps/browser-extension/src/storage/purchasedProducts.js")
    >("../../../apps/browser-extension/src/storage/purchasedProducts.js");
    return {
      ...actual,
      readActivePurchases: storageMocks.readActivePurchases,
    };
  },
);

vi.mock(
  "../../../apps/browser-extension/src/storage/priceDrops.js",
  () => ({
    upsertPriceDrop: dropsMocks.upsertPriceDrop,
    markPriceDropNotified: dropsMocks.markPriceDropNotified,
    shouldNotify: dropsMocks.shouldNotify,
  }),
);

vi.mock(
  "../../../apps/browser-extension/src/parsers/fetchPriceHistory.js",
  () => ({
    fetchPriceHistoryBatch: priceMocks.fetchPriceHistoryBatch,
  }),
);

import {
  buildPriceGuardUrl,
  checkPriceGuards,
  handlePriceGuardClick,
} from "../../../apps/browser-extension/src/background/priceGuardWorker.js";

const PURCHASE = {
  skuId: "100001",
  title: "立白 洗衣液 2kg",
  paidPrice: 100,
  sellerType: "self_operated" as const,
  url: "https://item.jd.com/100001.html",
  purchasedAt: Date.now() - 86400000,
};

function makeHistory(currentPrice: number) {
  return {
    trend: "low" as const,
    currentPrice,
    lowestPrice: 70,
    highestPrice: 120,
    averagePrice: 95,
  };
}

describe("checkPriceGuards", () => {
  beforeEach(() => {
    storageMocks.readActivePurchases.mockReset();
    dropsMocks.upsertPriceDrop
      .mockReset()
      .mockImplementation(async (input) => ({ ...input, detectedAt: Date.now() }));
    dropsMocks.markPriceDropNotified.mockReset().mockResolvedValue(undefined);
    dropsMocks.shouldNotify.mockReset().mockReturnValue(true);
    priceMocks.fetchPriceHistoryBatch.mockReset();
    browserMock.notifications.create.mockClear();
  });

  it("does nothing when no active purchases exist", async () => {
    storageMocks.readActivePurchases.mockResolvedValue([]);

    const drops = await checkPriceGuards();

    expect(drops).toEqual([]);
    expect(priceMocks.fetchPriceHistoryBatch).not.toHaveBeenCalled();
    expect(dropsMocks.upsertPriceDrop).not.toHaveBeenCalled();
    expect(browserMock.notifications.create).not.toHaveBeenCalled();
  });

  it("fetches all SKUs in a single batched call instead of serially", async () => {
    const second = { ...PURCHASE, skuId: "200002", title: "Other" };
    storageMocks.readActivePurchases.mockResolvedValue([PURCHASE, second]);
    priceMocks.fetchPriceHistoryBatch.mockResolvedValue({
      "100001": makeHistory(85),
      "200002": makeHistory(80),
    });

    const drops = await checkPriceGuards();

    expect(priceMocks.fetchPriceHistoryBatch).toHaveBeenCalledTimes(1);
    expect(priceMocks.fetchPriceHistoryBatch).toHaveBeenCalledWith([
      "100001",
      "200002",
    ]);
    expect(drops.map((d) => d.skuId).sort()).toEqual(["100001", "200002"]);
  });

  it("fires a price-guard notification when current price qualifies for 价保", async () => {
    storageMocks.readActivePurchases.mockResolvedValue([PURCHASE]);
    priceMocks.fetchPriceHistoryBatch.mockResolvedValue({
      "100001": makeHistory(85),
    });

    const drops = await checkPriceGuards();

    expect(drops).toHaveLength(1);
    expect(drops[0]).toMatchObject({
      skuId: "100001",
      paidPrice: 100,
      currentPrice: 85,
      droppedBy: 15,
    });
    expect(dropsMocks.upsertPriceDrop).toHaveBeenCalledWith(
      expect.objectContaining({ skuId: "100001", droppedBy: 15 }),
    );
    expect(browserMock.notifications.create).toHaveBeenCalledWith(
      "price-guard-100001",
      expect.objectContaining({
        title: "可申请价保",
        message: expect.stringContaining("85.00"),
      }),
    );
    const msg = browserMock.notifications.create.mock.calls[0]![1]!.message;
    expect(msg).toContain("¥15.00");
    expect(dropsMocks.markPriceDropNotified).toHaveBeenCalledWith("100001", 15);
  });

  it("does not notify when drop is below threshold (ratio)", async () => {
    storageMocks.readActivePurchases.mockResolvedValue([PURCHASE]);
    // 96 → 4% drop, under 5% cutoff
    priceMocks.fetchPriceHistoryBatch.mockResolvedValue({
      "100001": makeHistory(96),
    });

    const drops = await checkPriceGuards();

    expect(drops).toEqual([]);
    expect(dropsMocks.upsertPriceDrop).not.toHaveBeenCalled();
    expect(browserMock.notifications.create).not.toHaveBeenCalled();
  });

  it("records the drop but skips notification when shouldNotify returns false", async () => {
    storageMocks.readActivePurchases.mockResolvedValue([PURCHASE]);
    priceMocks.fetchPriceHistoryBatch.mockResolvedValue({
      "100001": makeHistory(85),
    });
    dropsMocks.shouldNotify.mockReturnValueOnce(false);

    const drops = await checkPriceGuards();

    expect(drops).toHaveLength(1);
    expect(dropsMocks.upsertPriceDrop).toHaveBeenCalled();
    expect(browserMock.notifications.create).not.toHaveBeenCalled();
    expect(dropsMocks.markPriceDropNotified).not.toHaveBeenCalled();
  });

  it("skips SKUs whose batch entry is null", async () => {
    const second = { ...PURCHASE, skuId: "200002", title: "Other" };
    storageMocks.readActivePurchases.mockResolvedValue([PURCHASE, second]);
    priceMocks.fetchPriceHistoryBatch.mockResolvedValue({
      "100001": null,
      "200002": makeHistory(80),
    });

    const drops = await checkPriceGuards();

    expect(drops.map((d) => d.skuId)).toEqual(["200002"]);
    expect(browserMock.notifications.create).toHaveBeenCalledTimes(1);
  });

  it("returns an empty list and does not throw when the batch fetch rejects", async () => {
    storageMocks.readActivePurchases.mockResolvedValue([PURCHASE]);
    priceMocks.fetchPriceHistoryBatch.mockRejectedValue(new Error("network"));

    const drops = await checkPriceGuards();

    expect(drops).toEqual([]);
    expect(browserMock.notifications.create).not.toHaveBeenCalled();
  });

  it("resolves with [] within 25s when the batch fetch hangs", async () => {
    vi.useFakeTimers();
    try {
      storageMocks.readActivePurchases.mockResolvedValue([PURCHASE]);
      // Never resolves
      priceMocks.fetchPriceHistoryBatch.mockReturnValue(new Promise(() => {}));
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const promise = checkPriceGuards();
      // Advance past the 25s guard timeout
      await vi.advanceTimersByTimeAsync(25_001);
      const drops = await promise;

      expect(drops).toEqual([]);
      expect(browserMock.notifications.create).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("guard pass exceeded"),
      );
      warnSpy.mockRestore();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("handlePriceGuardClick", () => {
  beforeEach(() => {
    browserMock.tabs.create.mockClear();
  });

  it("opens the JD price-guard application page for the matching SKU", () => {
    handlePriceGuardClick("price-guard-100001");
    expect(browserMock.tabs.create).toHaveBeenCalledWith({
      url: buildPriceGuardUrl("100001"),
    });
  });

  it("ignores notifications that are not price-guard", () => {
    handlePriceGuardClick("price-alert-100001");
    expect(browserMock.tabs.create).not.toHaveBeenCalled();
  });

  it("ignores malformed price-guard ids without a SKU", () => {
    handlePriceGuardClick("price-guard-");
    expect(browserMock.tabs.create).not.toHaveBeenCalled();
  });
});

describe("buildPriceGuardUrl", () => {
  it("encodes the SKU into the query string", () => {
    expect(buildPriceGuardUrl("100001")).toBe(
      "https://jprice.jd.com/bybr/p.action?sku=100001",
    );
  });
});
