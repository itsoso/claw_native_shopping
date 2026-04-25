import type { SellerType } from "./product.js";

export type PriceDrop = {
  skuId: string;
  title: string;
  paidPrice: number;
  currentPrice: number;
  droppedBy: number;
  url: string;
  sellerType: SellerType;
  detectedAt: number;
  dismissedAt?: number | undefined;
  // The drop amount the user was last notified about. Used by the worker to
  // suppress repeat notifications until the price drops noticeably further.
  lastNotifiedDropBy?: number | undefined;
};

export type PriceDropInput = Omit<PriceDrop, "detectedAt">;

// A new drop is considered "noticeably worse" than a previously notified one
// only if the saved amount grew by at least 20%. Below this we stay quiet so
// users aren't paged for noise.
export const REPEAT_NOTIFY_GROWTH_RATIO = 1.2;
