export type SellerType = "self_operated" | "marketplace";

export type PromotionRule = {
  type: "manjian";
  threshold: number;
  discount: number;
  label: string;
  stackableWithCoupon?: boolean | undefined;
};

export type CouponInfo = {
  value: number;
  threshold: number;
  label: string;
  stackable?: boolean | undefined;
};

export type ManzheRule = {
  type: "manzhe";
  thresholdQuantity: number;
  discountRate: number;
  label: string;
  stackableWithCoupon?: boolean | undefined;
};

export type SecondHalfRule = {
  type: "second_half";
  discountRate: number;
  label: string;
  stackableWithCoupon?: boolean | undefined;
};

export type CrossStoreManjianRule = {
  type: "cross_store_manjian";
  threshold: number;
  discount: number;
  label: string;
  stackableWithCoupon?: boolean | undefined;
};

export type PlusPrice = {
  value: number;
  label: string;
};

export type PromotionInfo = {
  rules: PromotionRule[];
  coupons: CouponInfo[];
  manzheRules?: ManzheRule[] | undefined;
  secondHalfRules?: SecondHalfRule[] | undefined;
  crossStoreRules?: CrossStoreManjianRule[] | undefined;
  plusPrice?: PlusPrice | undefined;
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
