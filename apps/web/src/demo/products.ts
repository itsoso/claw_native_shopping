import type { VerificationBadgeInfo } from "@extension/types/verification.js";
import type { DecisionMode } from "@extension/types/preferences.js";
import type { PriceHistoryInfo, ProductPageModel } from "@extension/types/product.js";

export type DemoProduct = {
  id: string;
  title: string;
  price: number;
  sellerType: "self_operated" | "marketplace";
  sellerName: string;
  deliveryEta: string;
  specs: string;
  category: string;
  verification: VerificationBadgeInfo | undefined;
  priceHistory: PriceHistoryInfo | undefined;
  alternatives: ProductPageModel[];
  alternativeUrls: Record<string, string>;
  recommendation: {
    primaryAction: string;
    reason: string;
    mode: DecisionMode;
  };
};

export const demoProducts: DemoProduct[] = [
  {
    id: "sku-rice-wuchang",
    title: "五常稻花香大米 5kg 2024年新米 东北大米 原产地直发",
    price: 89.9,
    sellerType: "self_operated",
    sellerName: "京东自营",
    deliveryEta: "预计明天送达",
    specs: "5kg / 袋",
    category: "粮油调味",
    verification: {
      verified: true,
      grade: "A",
      verifierName: "黑龙江农科院认证验证员",
      method: "实地溯源 + 实验室检测",
      summary: "正宗五常产区，香气浓郁，口感软糯，无农残超标",
      verificationCount: 3,
    },
    priceHistory: {
      trend: "average",
      currentPrice: 89.9,
      lowestPrice: 69.9,
      highestPrice: 119.9,
      averagePrice: 92.0,
    },
    alternatives: [
      { title: "盘锦大米 5kg", unitPrice: 59.9, sellerType: "self_operated", deliveryEta: "明天送达", packageLabel: null },
      { title: "泰国茉莉香米 5kg", unitPrice: 109.9, sellerType: "marketplace", deliveryEta: "后天送达", packageLabel: null },
    ],
    alternativeUrls: {
      "盘锦大米 5kg": "https://item.jd.com/demo-001.html",
      "泰国茉莉香米 5kg": "https://item.jd.com/demo-002.html",
    },
    recommendation: {
      primaryAction: "建议购买",
      reason: "品质验证 A 级，3 次独立验证确认正宗五常产区。京东自营渠道可靠，明日达配送。当前价格 ¥17.98/kg 处于历史均价区间。",
      mode: "safe",
    },
  },
  {
    id: "sku-beef-inner-mongolia",
    title: "内蒙古锡盟风干牛肉干 500g 手撕牛肉 草原特产",
    price: 128.0,
    sellerType: "marketplace",
    sellerName: "草原牧歌旗舰店",
    deliveryEta: "预计后天送达",
    specs: "500g / 袋",
    category: "休闲零食",
    verification: {
      verified: true,
      grade: "B",
      verifierName: "内蒙古食品协会验证员",
      method: "直播验货",
      summary: "真牛肉原料，口感偏硬但风味正宗，含水量略高于标准",
      verificationCount: 2,
    },
    priceHistory: {
      trend: "high",
      currentPrice: 128.0,
      lowestPrice: 89.0,
      highestPrice: 138.0,
      averagePrice: 108.0,
    },
    alternatives: [
      { title: "科尔沁风干牛肉 500g", unitPrice: 98.0, sellerType: "self_operated", deliveryEta: "明天送达", packageLabel: null },
      { title: "张飞牛肉干 500g", unitPrice: 79.9, sellerType: "marketplace", deliveryEta: null, packageLabel: null },
    ],
    alternativeUrls: {
      "科尔沁风干牛肉 500g": "https://item.jd.com/demo-003.html",
      "张飞牛肉干 500g": "https://item.jd.com/demo-004.html",
    },
    recommendation: {
      primaryAction: "可以购买",
      reason: "品质验证 B 级，原料真实但含水量略高。第三方店铺，建议关注保质期。¥256/kg 价格中等偏上，如不急可等促销。",
      mode: "value",
    },
  },
  {
    id: "sku-crab-yangcheng",
    title: "阳澄湖大闸蟹 公蟹 4.0两 母蟹 3.0两 4对8只礼盒装",
    price: 698.0,
    sellerType: "marketplace",
    sellerName: "蟹太太旗舰店",
    deliveryEta: "预计3天内发货",
    specs: "4对8只 / 礼盒",
    category: "生鲜水产",
    verification: undefined,
    priceHistory: {
      trend: "average",
      currentPrice: 698.0,
      lowestPrice: 598.0,
      highestPrice: 898.0,
      averagePrice: 720.0,
    },
    alternatives: [],
    alternativeUrls: {},
    recommendation: {
      primaryAction: "暂不建议购买",
      reason: "尚无品质验证数据，阳澄湖大闸蟹市场 \"洗澡蟹\" 比例较高。建议等待验证结果或选择已验证的替代商品。",
      mode: "safe",
    },
  },
  {
    id: "sku-apple-aksu",
    title: "新疆阿克苏冰糖心苹果 5kg 当季新鲜水果 产地直发",
    price: 59.9,
    sellerType: "self_operated",
    sellerName: "京东自营",
    deliveryEta: "预计明天送达",
    specs: "5kg / 箱 (约12-16个)",
    category: "新鲜水果",
    verification: {
      verified: true,
      grade: "A",
      verifierName: "新疆农产品质检中心",
      method: "实地溯源 + 照片审核",
      summary: "正宗阿克苏产区，冰糖心率 90%+，果径均匀，甜度达标",
      verificationCount: 4,
    },
    priceHistory: {
      trend: "low",
      currentPrice: 59.9,
      lowestPrice: 55.0,
      highestPrice: 89.9,
      averagePrice: 72.0,
    },
    alternatives: [
      { title: "烟台红富士苹果 5kg", unitPrice: 49.9, sellerType: "self_operated", deliveryEta: "明天送达", packageLabel: null },
      { title: "洛川苹果 5kg", unitPrice: 65.0, sellerType: "marketplace", deliveryEta: "后天送达", packageLabel: null },
    ],
    alternativeUrls: {
      "烟台红富士苹果 5kg": "https://item.jd.com/demo-005.html",
      "洛川苹果 5kg": "https://item.jd.com/demo-006.html",
    },
    recommendation: {
      primaryAction: "强烈推荐",
      reason: "品质验证 A 级，4 次验证确认正宗冰糖心。京东自营 + 冷链配送品质有保障。¥11.98/kg 性价比极高，当季最佳购入时机。",
      mode: "time_saving",
    },
  },
];
