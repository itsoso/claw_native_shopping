import { storage } from "wxt/utils/storage";

import type {
  PriceDropResult,
  PurchasedProduct,
  PurchasedProductInput,
} from "../types/purchasedProduct.js";
import {
  MIN_DROP_AMOUNT,
  PRICE_DROP_RATIO,
  PRICE_GUARD_WINDOW_DAYS,
} from "../types/purchasedProduct.js";

const STORAGE_KEY: `local:${string}` = "local:purchased-products";
const MAX_ENTRIES = 100;

export async function readPurchasedProducts(): Promise<PurchasedProduct[]> {
  const items = await storage.getItem<PurchasedProduct[]>(STORAGE_KEY);
  if (!items || !Array.isArray(items)) return [];
  return items.sort((a, b) => b.purchasedAt - a.purchasedAt);
}

export async function markPurchased(
  input: PurchasedProductInput,
): Promise<void> {
  const items = (await storage.getItem<PurchasedProduct[]>(STORAGE_KEY)) ?? [];
  const now = Date.now();

  const existingIndex = items.findIndex((p) => p.skuId === input.skuId);
  if (existingIndex >= 0) {
    items[existingIndex] = { ...input, purchasedAt: now };
  } else {
    items.push({ ...input, purchasedAt: now });
  }

  items.sort((a, b) => b.purchasedAt - a.purchasedAt);

  const capped = items.slice(0, MAX_ENTRIES);
  await storage.setItem(STORAGE_KEY, capped);
}

export async function clearPurchasedProducts(): Promise<void> {
  await storage.setItem(STORAGE_KEY, []);
}

/**
 * Only purchases within the price-guard window are eligible. Older records
 * are still kept in storage (history is useful) but excluded from active
 * monitoring to avoid spurious notifications.
 */
export async function readActivePurchases(
  now: number = Date.now(),
): Promise<PurchasedProduct[]> {
  const items = await readPurchasedProducts();
  const cutoff = now - PRICE_GUARD_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  return items.filter((p) => p.purchasedAt >= cutoff);
}

/**
 * Pure comparator used both by the background worker and unit tests.
 * Returns a drop record only when the current price crosses BOTH the
 * ratio and absolute-amount thresholds.
 */
export function checkPriceDrop(
  purchased: PurchasedProduct,
  currentPrice: number,
): PriceDropResult | null {
  if (!Number.isFinite(currentPrice) || currentPrice <= 0) return null;
  const droppedBy = purchased.paidPrice - currentPrice;
  if (droppedBy < MIN_DROP_AMOUNT) return null;
  if (currentPrice > purchased.paidPrice * PRICE_DROP_RATIO) return null;
  return {
    skuId: purchased.skuId,
    title: purchased.title,
    paidPrice: purchased.paidPrice,
    currentPrice,
    droppedBy,
    url: purchased.url,
  };
}
