import { describe, expect, it } from "vitest";

import { rankOffers } from "../../packages/offer-evaluator/src/score.js";
import type { OfferCandidate } from "../../packages/offer-evaluator/src/score.js";

describe("rankOffers with verificationScore", () => {
  it("preserves original weights when verificationScore is absent", () => {
    const offers: OfferCandidate[] = [
      { sellerId: "s1", totalCost: 20, etaHours: 4, trust: 0.9, policyMatch: 1.0 },
      { sellerId: "s2", totalCost: 18, etaHours: 20, trust: 0.4, policyMatch: 0.7 },
    ];

    const ranked = rankOffers(offers);
    expect(ranked[0]!.sellerId).toBe("s1");
    expect(ranked[1]!.sellerId).toBe("s2");
  });

  it("boosts a verified offer over an unverified one with similar base stats", () => {
    const verified: OfferCandidate = {
      sellerId: "s_verified",
      totalCost: 22,
      etaHours: 5,
      trust: 0.75,
      policyMatch: 0.85,
      verificationScore: 0.95,
    };

    const unverified: OfferCandidate = {
      sellerId: "s_unverified",
      totalCost: 20,
      etaHours: 4,
      trust: 0.78,
      policyMatch: 0.85,
    };

    const ranked = rankOffers([unverified, verified]);
    expect(ranked[0]!.sellerId).toBe("s_verified");
  });

  it("treats verificationScore=0 as using verification-aware weights", () => {
    const withZero: OfferCandidate = {
      sellerId: "s_zero",
      totalCost: 20,
      etaHours: 4,
      trust: 0.9,
      policyMatch: 1.0,
      verificationScore: 0,
    };

    const without: OfferCandidate = {
      sellerId: "s_none",
      totalCost: 20,
      etaHours: 4,
      trust: 0.9,
      policyMatch: 1.0,
    };

    const rankedWithZero = rankOffers([withZero]);
    const rankedWithout = rankOffers([without]);

    expect(rankedWithZero[0]!.score).not.toBe(rankedWithout[0]!.score);
  });

  it("ranks higher verification score above lower when other factors equal", () => {
    const highVerification: OfferCandidate = {
      sellerId: "s_high",
      totalCost: 20,
      etaHours: 4,
      trust: 0.8,
      policyMatch: 0.9,
      verificationScore: 0.95,
    };

    const lowVerification: OfferCandidate = {
      sellerId: "s_low",
      totalCost: 20,
      etaHours: 4,
      trust: 0.8,
      policyMatch: 0.9,
      verificationScore: 0.3,
    };

    const ranked = rankOffers([lowVerification, highVerification]);
    expect(ranked[0]!.sellerId).toBe("s_high");
  });
});
