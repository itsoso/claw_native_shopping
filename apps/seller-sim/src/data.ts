export type SellerCatalogItem = {
  category: string;
  productId: string;
  unitPrice: number;
};

export const sellerCatalog: SellerCatalogItem[] = [
  { category: "eggs", productId: "egg-12", unitPrice: 15 }
];
