import type { PriceHistoryInfo, PriceTrend } from "../types/product.js";

type GwdangResponse = {
  code: number;
  data: {
    list: { date: string; price: number }[];
    highest: number;
    lowest: number;
    current: number;
  };
};

type ManmanbuyResponse = {
  ok: number;
  data: { date: string; price: number }[];
  lowest: number;
  highest: number;
};

export function classifyTrend(
  currentPrice: number,
  lowestPrice: number,
  highestPrice: number,
  averagePrice: number,
): PriceTrend {
  const range = highestPrice - lowestPrice;
  if (range === 0) return "average";

  const position = (currentPrice - lowestPrice) / range;
  if (position <= 0.33) return "low";
  if (position >= 0.67) return "high";
  return "average";
}

export function computeAverage(prices: number[]): number {
  if (prices.length === 0) return 0;
  const sum = prices.reduce((a, b) => a + b, 0);
  return Math.round((sum / prices.length) * 100) / 100;
}

async function tryGwdang(skuId: string): Promise<PriceHistoryInfo | null> {
  const url = `https://browser.gwdang.com/price/trend?platform=1&product_id=${skuId}&days=180`;
  const response = await fetch(url, {
    headers: { Referer: "https://browser.gwdang.com/" },
  });

  if (!response.ok) return null;

  const json = (await response.json()) as GwdangResponse;
  if (json.code !== 0 || !json.data?.list?.length) return null;

  const currentPrice = json.data.current;
  const lowestPrice = json.data.lowest;
  const highestPrice = json.data.highest;
  const averagePrice = computeAverage(json.data.list.map((p) => p.price));

  return {
    trend: classifyTrend(currentPrice, lowestPrice, highestPrice, averagePrice),
    currentPrice,
    lowestPrice,
    highestPrice,
    averagePrice,
  };
}

async function tryManmanbuy(skuId: string): Promise<PriceHistoryInfo | null> {
  const productUrl = encodeURIComponent(`https://item.jd.com/${skuId}.html`);
  const url = `https://tool.manmanbuy.com/history.aspx?action=gethistory&url=${productUrl}`;
  const response = await fetch(url, {
    headers: { Referer: "https://tool.manmanbuy.com/" },
  });

  if (!response.ok) return null;

  const json = (await response.json()) as ManmanbuyResponse;
  if (json.ok !== 1 || !json.data?.length) return null;

  const prices = json.data.map((p) => p.price);
  const currentPrice = prices[prices.length - 1]!;
  const lowestPrice = json.lowest;
  const highestPrice = json.highest;
  const averagePrice = computeAverage(prices);

  return {
    trend: classifyTrend(currentPrice, lowestPrice, highestPrice, averagePrice),
    currentPrice,
    lowestPrice,
    highestPrice,
    averagePrice,
  };
}

export async function fetchPriceHistory(
  skuId: string,
): Promise<PriceHistoryInfo | null> {
  try {
    const result = await tryGwdang(skuId);
    if (result) return result;
  } catch {
    // fall through to next provider
  }

  try {
    return await tryManmanbuy(skuId);
  } catch {
    return null;
  }
}

export async function requestPriceHistory(
  skuId: string,
): Promise<PriceHistoryInfo | null> {
  try {
    const response = await browser.runtime.sendMessage({
      action: "fetchPriceHistory",
      skuId,
    });
    if (
      typeof response === "object" &&
      response !== null &&
      "success" in response &&
      (response as { success: boolean }).success
    ) {
      return (response as { data: PriceHistoryInfo | null }).data;
    }
    return null;
  } catch {
    return null;
  }
}
