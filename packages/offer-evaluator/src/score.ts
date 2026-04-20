export type OfferCandidate = {
  sellerId: string;
  totalCost: number;
  etaHours: number;
  trust: number;
  policyMatch: number;
  verificationScore?: number | undefined;
};

export type RankedOffer = OfferCandidate & {
  score: number;
};

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

const scoreOffer = (offer: OfferCandidate): number => {
  const normalizedPolicy = clamp01(offer.policyMatch);
  const normalizedTrust = clamp01(offer.trust);
  const normalizedEta = 1 / (1 + Math.max(0, offer.etaHours));
  const normalizedCost = 1 / (1 + Math.max(0, offer.totalCost));

  if (offer.verificationScore !== undefined) {
    const normalizedVerification = clamp01(offer.verificationScore);
    return (
      normalizedPolicy * 0.4 +
      normalizedTrust * 0.25 +
      normalizedVerification * 0.15 +
      normalizedEta * 0.12 +
      normalizedCost * 0.08
    );
  }

  return (
    normalizedPolicy * 0.5 +
    normalizedTrust * 0.3 +
    normalizedEta * 0.15 +
    normalizedCost * 0.05
  );
};

export const rankOffers = (offers: OfferCandidate[]): RankedOffer[] =>
  offers
    .map((offer) => ({
      ...offer,
      score: scoreOffer(offer)
    }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.sellerId.localeCompare(right.sellerId);
    });
