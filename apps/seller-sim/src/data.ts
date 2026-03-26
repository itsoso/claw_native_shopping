export type SellerCatalogItem = {
  category: string;
  productId: string;
  unitPrice: number;
};

export const sellerCatalog: SellerCatalogItem[] = [
  { category: "eggs", productId: "egg-12", unitPrice: 15 },
  { category: "laundry-detergent", productId: "laundry-2l", unitPrice: 42 },
  { category: "cart-threshold-booster", productId: "softener-1l", unitPrice: 18 },
  { category: "seller-eta-balance", productId: "stain-remover-500ml", unitPrice: 26 },
];
