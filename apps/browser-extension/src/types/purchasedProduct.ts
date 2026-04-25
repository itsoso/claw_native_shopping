import type { SellerType } from "./product.js";

export type PurchasedProduct = {
  skuId: string;
  title: string;
  paidPrice: number;
  sellerType: SellerType;
  url: string;
  purchasedAt: number;
};

export type PurchasedProductInput = Omit<PurchasedProduct, "purchasedAt">;

export type PriceDropResult = {
  skuId: string;
  title: string;
  paidPrice: number;
  currentPrice: number;
  droppedBy: number;
  url: string;
};

// JD 30-day price protection window
export const PRICE_GUARD_WINDOW_DAYS = 30;

// Require current price to be at least 5% below paid price to trigger a drop,
// and the absolute difference to clear ¥1. Both together keep rounding noise
// and ¥0.01 fluctuations from paging the user.
export const PRICE_DROP_RATIO = 0.95;
export const MIN_DROP_AMOUNT = 1;
