import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { fetchVerification } from "../../../apps/browser-extension/src/recommendation/fetchVerification.js";

const mockSearchResponse = {
  products: [
    {
      skuId: "ks_beef_001",
      name: "内蒙古锡盟风干牛肉干 500g",
      verified: true,
      bestGrade: "A",
      verificationCount: 3,
    },
  ],
};

const mockProductDetail = {
  skuId: "ks_beef_001",
  name: "内蒙古锡盟风干牛肉干 500g",
  verificationReport: {
    verified: true,
    verificationCount: 3,
    records: [
      {
        verifierId: "anchor_zhang",
        verifierTrustScore: 0.91,
        method: "live_tasting",
        structuredAssessment: {
          texture: "适中偏硬",
          flavor: "原味，微咸",
          appearance: "色泽均匀",
          overallGrade: "A",
        },
      },
    ],
  },
};

describe("fetchVerification", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns VerificationBadgeInfo when API has matching product", async () => {
    const mockFetch = globalThis.fetch as ReturnType<typeof vi.fn>;

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSearchResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProductDetail),
      });

    const result = await fetchVerification("牛肉干 内蒙古特产");
    expect(result).not.toBeNull();
    expect(result!.verified).toBe(true);
    expect(result!.grade).toBe("A");
    expect(result!.verifierName).toBe("anchor_zhang");
  });

  it("returns null when API returns no matching product", async () => {
    const mockFetch = globalThis.fetch as ReturnType<typeof vi.fn>;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ products: [] }),
    });

    const result = await fetchVerification("完全不相关的产品名称");
    expect(result).toBeNull();
  });

  it("returns null when search request fails", async () => {
    const mockFetch = globalThis.fetch as ReturnType<typeof vi.fn>;
    mockFetch.mockRejectedValueOnce(new Error("network error"));

    const result = await fetchVerification("牛肉干");
    expect(result).toBeNull();
  });

  it("returns null when search returns non-200", async () => {
    const mockFetch = globalThis.fetch as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const result = await fetchVerification("牛肉干");
    expect(result).toBeNull();
  });
});
