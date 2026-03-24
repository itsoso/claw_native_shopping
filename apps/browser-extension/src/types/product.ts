export type SellerType = "self_operated" | "marketplace";

export type ProductPageModel = {
  title: string;
  unitPrice: number;
  sellerType: SellerType;
  deliveryEta: string | null;
  packageLabel: string | null;
};
