import type { VerificationBadgeInfo } from "@extension/types/verification.js";
import type { DecisionMode } from "@extension/types/preferences.js";

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
    recommendation: {
      primaryAction: "强烈推荐",
      reason: "品质验证 A 级，4 次验证确认正宗冰糖心。京东自营 + 冷链配送品质有保障。¥11.98/kg 性价比极高，当季最佳购入时机。",
      mode: "time_saving",
    },
  },
];
