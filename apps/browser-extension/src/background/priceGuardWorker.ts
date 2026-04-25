import { fetchPriceHistory } from "../parsers/fetchPriceHistory.js";
import {
  checkPriceDrop,
  readActivePurchases,
} from "../storage/purchasedProducts.js";
import type { PriceDropResult } from "../types/purchasedProduct.js";

const NOTIFICATION_PREFIX = "price-guard-";

// JD's price-protection application page takes `?sku=` in the query string.
const JD_PRICE_GUARD_URL = "https://jprice.jd.com/bybr/p.action";

export function buildPriceGuardUrl(skuId: string): string {
  return `${JD_PRICE_GUARD_URL}?sku=${encodeURIComponent(skuId)}`;
}

export async function checkPriceGuards(): Promise<PriceDropResult[]> {
  const active = await readActivePurchases();
  if (active.length === 0) return [];

  const drops: PriceDropResult[] = [];

  for (const purchased of active) {
    try {
      const history = await fetchPriceHistory(purchased.skuId);
      if (!history) continue;

      const drop = checkPriceDrop(purchased, history.currentPrice);
      if (!drop) continue;

      drops.push(drop);

      await browser.notifications.create(`${NOTIFICATION_PREFIX}${drop.skuId}`, {
        type: "basic",
        iconUrl: browser.runtime.getURL("icon/128.png"),
        title: "可申请价保",
        message: `${drop.title} 降至 ¥${drop.currentPrice.toFixed(2)}（已购 ¥${drop.paidPrice.toFixed(2)}，可退 ¥${drop.droppedBy.toFixed(2)}）`,
      });
    } catch {
      // continue with remaining purchases on any fetch or notification error
    }
  }

  return drops;
}

export function handlePriceGuardClick(notificationId: string): void {
  if (!notificationId.startsWith(NOTIFICATION_PREFIX)) return;
  const skuId = notificationId.slice(NOTIFICATION_PREFIX.length);
  if (!skuId) return;
  void browser.tabs.create({ url: buildPriceGuardUrl(skuId) });
}
