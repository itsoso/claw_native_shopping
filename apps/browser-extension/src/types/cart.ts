import type {
  CouponInfo,
  CrossStoreManjianRule,
  DiscountBreakdown,
  SellerType,
} from "./product.js";

export type CartItem = {
  title: string;
  unitPrice: number;
  quantity: number;
  sellerType: SellerType;
  packageLabel: string | null;
  shopId?: string | undefined;
};

export type CartThresholdRule = {
  threshold: number;
  discount: number;
};

export type CartPageModel = {
  items: CartItem[];
  thresholdRules: CartThresholdRule[];
  couponsByShop?: Record<string, CouponInfo[]> | undefined;
  crossStoreRules?: CrossStoreManjianRule[] | undefined;
};

export type CartPlanOutput = {
  summary: string;
  actions: string[];
  effectiveTotal?: number | undefined;
  discount?: number | undefined;
  breakdown?: DiscountBreakdown[] | undefined;
};

export type TopUpCandidate = {
  title: string;
  price: number;
  sourceUrl: string;
};

export type TopUpProvider = (gap: number) => Promise<TopUpCandidate[]>;

export type OptimalTopUp = {
  item: CartItem;
  units: number;
  addedCost: number;
  overflow: number;
  netSaved: number;
};
