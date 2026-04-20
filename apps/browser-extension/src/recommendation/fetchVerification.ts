import type { VerificationBadgeInfo, VerificationGrade } from "../types/verification.js";

const VERIFICATION_API_BASE = "http://localhost:3200";

type ProductSummary = {
  skuId: string;
  name: string;
  verified: boolean;
  bestGrade: string | null;
  verificationCount: number;
};

type SearchResponse = {
  products: ProductSummary[];
};

type VerificationRecord = {
  verifierId: string;
  verifierTrustScore: number;
  method: string;
  structuredAssessment: {
    texture: string;
    flavor: string;
    appearance: string;
    overallGrade: string;
  };
};

type ProductDetail = {
  skuId: string;
  name: string;
  verificationReport: {
    verified: boolean;
    verificationCount: number;
    records: VerificationRecord[];
  };
};

function findBestMatch(products: ProductSummary[], title: string): ProductSummary | null {
  const normalizedTitle = title.toLowerCase();
  for (const product of products) {
    const normalizedName = product.name.toLowerCase();
    if (normalizedTitle.includes(normalizedName) || normalizedName.includes(normalizedTitle)) {
      return product;
    }
    const titleTokens = normalizedTitle.split(/\s+/);
    const nameTokens = normalizedName.split(/\s+/);
    const matched =
      nameTokens.some((token) => token.length >= 2 && normalizedTitle.includes(token)) ||
      titleTokens.some((token) => token.length >= 2 && normalizedName.includes(token));
    if (matched) return product;
  }
  return null;
}

function toBadgeInfo(product: ProductDetail): VerificationBadgeInfo | null {
  const report = product.verificationReport;
  if (!report.verified || report.records.length === 0) return null;

  const best = report.records.reduce((a, b) =>
    a.verifierTrustScore >= b.verifierTrustScore ? a : b
  );

  const grade = best.structuredAssessment.overallGrade;
  if (grade !== "A" && grade !== "B" && grade !== "C" && grade !== "D") return null;

  const methodLabels: Record<string, string> = {
    live_tasting: "直播品鉴",
    live_inspection: "直播验货",
    photo_review: "图片审核",
    lab_test: "实验室检测",
  };

  return {
    verified: true,
    grade: grade as VerificationGrade,
    verifierName: best.verifierId,
    method: methodLabels[best.method] ?? best.method,
    summary: `${best.structuredAssessment.flavor}；${best.structuredAssessment.appearance}`,
    verificationCount: report.verificationCount,
  };
}

export async function fetchVerification(
  productTitle: string,
): Promise<VerificationBadgeInfo | null> {
  try {
    const searchResponse = await fetch(`${VERIFICATION_API_BASE}/v0.1/products/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ has_verification: true }),
    });

    if (!searchResponse.ok) return null;

    const searchData = (await searchResponse.json()) as SearchResponse;
    const match = findBestMatch(searchData.products, productTitle);
    if (!match) return null;

    const detailResponse = await fetch(
      `${VERIFICATION_API_BASE}/v0.1/products/${match.skuId}`,
    );

    if (!detailResponse.ok) return null;

    const detail = (await detailResponse.json()) as ProductDetail;
    return toBadgeInfo(detail);
  } catch {
    return null;
  }
}
