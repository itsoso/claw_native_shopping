import { beforeEach, describe, expect, it, vi } from "vitest";

const storageMocks = vi.hoisted(() => ({
  readActivePurchases: vi.fn(),
}));

const priceMocks = vi.hoisted(() => ({
  fetchPriceHistory: vi.fn(),
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
  "../../../apps/browser-extension/src/parsers/fetchPriceHistory.js",
  () => ({
    fetchPriceHistory: priceMocks.fetchPriceHistory,
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

describe("checkPriceGuards", () => {
  beforeEach(() => {
    storageMocks.readActivePurchases.mockReset();
    priceMocks.fetchPriceHistory.mockReset();
    browserMock.notifications.create.mockClear();
  });

  it("does nothing when no active purchases exist", async () => {
    storageMocks.readActivePurchases.mockResolvedValue([]);

    const drops = await checkPriceGuards();

    expect(drops).toEqual([]);
    expect(priceMocks.fetchPriceHistory).not.toHaveBeenCalled();
    expect(browserMock.notifications.create).not.toHaveBeenCalled();
  });

  it("fires a price-guard notification when current price qualifies for 价保", async () => {
    storageMocks.readActivePurchases.mockResolvedValue([PURCHASE]);
    priceMocks.fetchPriceHistory.mockResolvedValue({
      trend: "low",
      currentPrice: 85,
      lowestPrice: 80,
      highestPrice: 120,
      averagePrice: 95,
    });

    const drops = await checkPriceGuards();

    expect(drops).toHaveLength(1);
    expect(drops[0]).toMatchObject({
      skuId: "100001",
      paidPrice: 100,
      currentPrice: 85,
      droppedBy: 15,
    });
    expect(browserMock.notifications.create).toHaveBeenCalledWith(
      "price-guard-100001",
      expect.objectContaining({
        title: "可申请价保",
        message: expect.stringContaining("85.00"),
      }),
    );
    const msg = browserMock.notifications.create.mock.calls[0]![1]!.message;
    expect(msg).toContain("¥15.00");
  });

  it("does not notify when drop is below threshold (ratio)", async () => {
    storageMocks.readActivePurchases.mockResolvedValue([PURCHASE]);
    // 96 → 4% drop, under 5% cutoff
    priceMocks.fetchPriceHistory.mockResolvedValue({
      trend: "average",
      currentPrice: 96,
      lowestPrice: 80,
      highestPrice: 120,
      averagePrice: 95,
    });

    const drops = await checkPriceGuards();

    expect(drops).toEqual([]);
    expect(browserMock.notifications.create).not.toHaveBeenCalled();
  });

  it("continues with remaining purchases when a fetch fails", async () => {
    const second = { ...PURCHASE, skuId: "200002", title: "Other" };
    storageMocks.readActivePurchases.mockResolvedValue([PURCHASE, second]);
    priceMocks.fetchPriceHistory
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce({
        trend: "low",
        currentPrice: 80,
        lowestPrice: 70,
        highestPrice: 120,
        averagePrice: 95,
      });

    const drops = await checkPriceGuards();

    expect(priceMocks.fetchPriceHistory).toHaveBeenCalledTimes(2);
    expect(drops.map((d) => d.skuId)).toEqual(["200002"]);
  });

  it("skips purchases for which fetchPriceHistory returns null", async () => {
    storageMocks.readActivePurchases.mockResolvedValue([PURCHASE]);
    priceMocks.fetchPriceHistory.mockResolvedValue(null);

    const drops = await checkPriceGuards();

    expect(drops).toEqual([]);
    expect(browserMock.notifications.create).not.toHaveBeenCalled();
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
