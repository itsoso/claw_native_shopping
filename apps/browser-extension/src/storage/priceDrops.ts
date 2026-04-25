import { storage } from "wxt/utils/storage";

import type { PriceDrop, PriceDropInput } from "../types/priceDrop.js";
import { REPEAT_NOTIFY_GROWTH_RATIO } from "../types/priceDrop.js";
import { PRICE_GUARD_WINDOW_DAYS } from "../types/purchasedProduct.js";

const STORAGE_KEY: `local:${string}` = "local:price-drops";
const MAX_ENTRIES = 100;

export async function readPriceDrops(): Promise<PriceDrop[]> {
  const items = await storage.getItem<PriceDrop[]>(STORAGE_KEY);
  if (!items || !Array.isArray(items)) return [];
  return items.sort((a, b) => b.detectedAt - a.detectedAt);
}

/**
 * Insert a fresh drop, or refresh an existing one for the same SKU. The
 * previously-notified delta is preserved so the worker can decide whether
 * to re-notify based on growth.
 */
export async function upsertPriceDrop(
  input: PriceDropInput,
): Promise<PriceDrop> {
  const items = (await storage.getItem<PriceDrop[]>(STORAGE_KEY)) ?? [];
  const now = Date.now();

  const existingIndex = items.findIndex((d) => d.skuId === input.skuId);
  let merged: PriceDrop;
  if (existingIndex >= 0) {
    const previous = items[existingIndex]!;
    merged = {
      ...previous,
      ...input,
      detectedAt: now,
      // Keep dismissed state and last-notified watermark intact across refreshes.
      dismissedAt: previous.dismissedAt,
      lastNotifiedDropBy: previous.lastNotifiedDropBy,
    };
    items[existingIndex] = merged;
  } else {
    merged = { ...input, detectedAt: now };
    items.push(merged);
  }

  items.sort((a, b) => b.detectedAt - a.detectedAt);
  const capped = items.slice(0, MAX_ENTRIES);
  await storage.setItem(STORAGE_KEY, capped);
  return merged;
}

/**
 * Active drops: within the price-guard window, not dismissed by the user.
 * Used by the dialog and badge.
 */
export async function readActivePriceDrops(
  now: number = Date.now(),
): Promise<PriceDrop[]> {
  const items = await readPriceDrops();
  const cutoff = now - PRICE_GUARD_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  return items.filter((d) => d.detectedAt >= cutoff && !d.dismissedAt);
}

export async function dismissPriceDrop(skuId: string): Promise<void> {
  const items = (await storage.getItem<PriceDrop[]>(STORAGE_KEY)) ?? [];
  const idx = items.findIndex((d) => d.skuId === skuId);
  if (idx < 0) return;
  items[idx] = { ...items[idx]!, dismissedAt: Date.now() };
  await storage.setItem(STORAGE_KEY, items);
}

export async function markPriceDropNotified(
  skuId: string,
  droppedBy: number,
): Promise<void> {
  const items = (await storage.getItem<PriceDrop[]>(STORAGE_KEY)) ?? [];
  const idx = items.findIndex((d) => d.skuId === skuId);
  if (idx < 0) return;
  items[idx] = { ...items[idx]!, lastNotifiedDropBy: droppedBy };
  await storage.setItem(STORAGE_KEY, items);
}

export async function clearPriceDrops(): Promise<void> {
  await storage.setItem(STORAGE_KEY, []);
}

/**
 * Pure: should the worker (re-)notify the user about this drop? First-time
 * drops always notify; repeats only if the absolute saved amount has grown
 * by at least the REPEAT_NOTIFY_GROWTH_RATIO factor.
 */
export function shouldNotify(
  drop: PriceDrop,
  newDroppedBy: number,
): boolean {
  if (drop.dismissedAt) return false;
  const previous = drop.lastNotifiedDropBy ?? 0;
  if (previous <= 0) return newDroppedBy > 0;
  return newDroppedBy >= previous * REPEAT_NOTIFY_GROWTH_RATIO;
}
