export type SellerType = "self_operated" | "marketplace";

export type ProductPageModel = {
  title: string;
  unitPrice: number;
  sellerType: SellerType;
  deliveryEta: string | null;
  packageLabel: string | null;
};

export type PriceTrend = "low" | "average" | "high";

export type PriceHistoryInfo = {
  trend: PriceTrend;
  currentPrice: number;
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
};
