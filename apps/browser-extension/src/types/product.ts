export type SellerType = "self_operated" | "marketplace";

export type PromotionRule = {
  type: "manjian";
  threshold: number;
  discount: number;
  label: string;
};

export type CouponInfo = {
  value: number;
  threshold: number;
  label: string;
};

export type PromotionInfo = {
  rules: PromotionRule[];
  coupons: CouponInfo[];
};

export type ProductPageModel = {
  title: string;
  unitPrice: number;
  sellerType: SellerType;
  deliveryEta: string | null;
  packageLabel: string | null;
  promotions?: PromotionInfo | undefined;
  effectivePrice?: number | undefined;
};

export type PriceTrend = "low" | "average" | "high";

export type PriceHistoryInfo = {
  trend: PriceTrend;
  currentPrice: number;
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
};
