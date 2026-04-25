import { fetchPriceHistoryBatch } from "../parsers/fetchPriceHistory.js";
import {
  markPriceDropNotified,
  shouldNotify,
  upsertPriceDrop,
} from "../storage/priceDrops.js";
import {
  checkPriceDrop,
  readActivePurchases,
} from "../storage/purchasedProducts.js";
import type { PriceDropResult } from "../types/purchasedProduct.js";

const NOTIFICATION_PREFIX = "price-guard-";

// JD's price-protection application page takes `?sku=` in the query string.
const JD_PRICE_GUARD_URL = "https://jprice.jd.com/bybr/p.action";

// Chrome MV3 service workers terminate after ~30s idle; bound the whole
// guard pass to leave headroom for storage writes and notification dispatch.
const GUARD_TIMEOUT_MS = 25_000;

export function buildPriceGuardUrl(skuId: string): string {
  return `${JD_PRICE_GUARD_URL}?sku=${encodeURIComponent(skuId)}`;
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise<T>((resolve) => {
    const timer = setTimeout(() => {
      console.warn(`[priceGuard] guard pass exceeded ${ms}ms, returning partial results`);
      resolve(fallback);
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(fallback);
      },
    );
  });
}

async function runGuardPass(): Promise<PriceDropResult[]> {
  const active = await readActivePurchases();
  if (active.length === 0) return [];

  const skuIds = active.map((p) => p.skuId);
  const histories = await fetchPriceHistoryBatch(skuIds);

  const drops: PriceDropResult[] = [];

  for (const purchased of active) {
    try {
      const history = histories[purchased.skuId];
      if (!history) continue;

      const drop = checkPriceDrop(purchased, history.currentPrice);
      if (!drop) continue;

      drops.push(drop);

      // Persist the drop record (used by the dialog and badge), then decide
      // whether to actually push a Chrome notification based on growth.
      const stored = await upsertPriceDrop({
        skuId: drop.skuId,
        title: drop.title,
        paidPrice: drop.paidPrice,
        currentPrice: drop.currentPrice,
        droppedBy: drop.droppedBy,
        url: drop.url,
        sellerType: purchased.sellerType,
      });

      if (!shouldNotify(stored, drop.droppedBy)) continue;

      await browser.notifications.create(`${NOTIFICATION_PREFIX}${drop.skuId}`, {
        type: "basic",
        iconUrl: browser.runtime.getURL("icon/128.png"),
        title: "可申请价保",
        message: `${drop.title} 降至 ¥${drop.currentPrice.toFixed(2)}（已购 ¥${drop.paidPrice.toFixed(2)}，可退 ¥${drop.droppedBy.toFixed(2)}）`,
      });
      await markPriceDropNotified(drop.skuId, drop.droppedBy);
    } catch {
      // continue with remaining purchases on any storage or notification error
    }
  }

  return drops;
}

export async function checkPriceGuards(): Promise<PriceDropResult[]> {
  return withTimeout(runGuardPass(), GUARD_TIMEOUT_MS, []);
}

export function handlePriceGuardClick(notificationId: string): void {
  if (!notificationId.startsWith(NOTIFICATION_PREFIX)) return;
  const skuId = notificationId.slice(NOTIFICATION_PREFIX.length);
  if (!skuId) return;
  void browser.tabs.create({ url: buildPriceGuardUrl(skuId) });
}
