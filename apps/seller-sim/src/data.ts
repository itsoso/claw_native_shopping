export type SellerCatalogItem = {
  category: string;
  productId: string;
  sellerAgentId: string;
  unitPrice: number;
  shippingFee: number;
  etaHours: number;
  deliveryEta: string;
  trustScore: number;
  policyMatch: number;
};

export const sellerCatalog: SellerCatalogItem[] = [
  {
    category: "eggs",
    productId: "egg-12",
    sellerAgentId: "seller_1",
    unitPrice: 15,
    shippingFee: 0,
    etaHours: 9,
    deliveryEta: "2026-03-24T09:00:00+08:00",
    trustScore: 0.9,
    policyMatch: 1,
  },
  {
    category: "eggs",
    productId: "egg-12",
    sellerAgentId: "seller_2",
    unitPrice: 14,
    shippingFee: 3,
    etaHours: 16,
    deliveryEta: "2026-03-24T16:00:00+08:00",
    trustScore: 0.6,
    policyMatch: 0.8,
  },
  {
    category: "laundry-detergent",
    productId: "laundry-2l",
    sellerAgentId: "seller_1",
    unitPrice: 42,
    shippingFee: 0,
    etaHours: 9,
    deliveryEta: "2026-03-24T09:00:00+08:00",
    trustScore: 0.92,
    policyMatch: 1,
  },
  {
    category: "laundry-detergent",
    productId: "laundry-2l",
    sellerAgentId: "seller_2",
    unitPrice: 38,
    shippingFee: 6,
    etaHours: 20,
    deliveryEta: "2026-03-24T20:00:00+08:00",
    trustScore: 0.65,
    policyMatch: 0.85,
  },
  {
    category: "cart-threshold-booster",
    productId: "softener-1l",
    sellerAgentId: "seller_1",
    unitPrice: 18,
    shippingFee: 0,
    etaHours: 10,
    deliveryEta: "2026-03-24T10:00:00+08:00",
    trustScore: 0.88,
    policyMatch: 0.95,
  },
  {
    category: "cart-threshold-booster",
    productId: "softener-1l",
    sellerAgentId: "seller_3",
    unitPrice: 16,
    shippingFee: 4,
    etaHours: 34,
    deliveryEta: "2026-03-25T10:00:00+08:00",
    trustScore: 0.58,
    policyMatch: 0.75,
  },
  {
    category: "seller-eta-balance",
    productId: "stain-remover-500ml",
    sellerAgentId: "seller_1",
    unitPrice: 26,
    shippingFee: 0,
    etaHours: 12,
    deliveryEta: "2026-03-24T12:00:00+08:00",
    trustScore: 0.86,
    policyMatch: 0.95,
  },
  {
    category: "seller-eta-balance",
    productId: "stain-remover-500ml",
    sellerAgentId: "seller_2",
    unitPrice: 22,
    shippingFee: 5,
    etaHours: 42,
    deliveryEta: "2026-03-25T18:00:00+08:00",
    trustScore: 0.62,
    policyMatch: 0.82,
  },
];
