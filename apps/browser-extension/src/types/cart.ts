import type { SellerType } from "./product.js";

export type CartItem = {
  title: string;
  unitPrice: number;
  quantity: number;
  sellerType: SellerType;
  packageLabel: string | null;
};

export type CartThresholdRule = {
  threshold: number;
  discount: number;
};

export type CartPageModel = {
  items: CartItem[];
  thresholdRules: CartThresholdRule[];
};

export type CartPlanOutput = {
  summary: string;
  actions: string[];
};
