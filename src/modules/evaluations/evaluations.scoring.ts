import { RatingBand } from '@prisma/client';

const BAND_TO_POINTS: Record<RatingBand, number> = {
  VERY_POOR: 1,
  POOR: 2,
  FAIR: 3,
  GOOD: 4,
  EXCELLENT: 5,
};

export function bandToPoints(b: RatingBand): number {
  return BAND_TO_POINTS[b];
}

/**
 * Five criteria on a 1–5 scale → average × 4 → score in [4, 20].
 */
export function computeScoreFromRatings(input: {
  comprehensionRating: RatingBand;
  explanationRating: RatingBand;
  pedagogyRating: RatingBand;
  availabilityRating: RatingBand;
  rhythmRating: RatingBand;
}): number {
  const values = [
    bandToPoints(input.comprehensionRating),
    bandToPoints(input.explanationRating),
    bandToPoints(input.pedagogyRating),
    bandToPoints(input.availabilityRating),
    bandToPoints(input.rhythmRating),
  ];
  const avg = values.reduce((a, b) => a + b, 0) / 5;
  const score = avg * 4;
  return Math.round(score * 100) / 100;
}

export type FiveRatings = {
  comprehensionRating: RatingBand;
  explanationRating: RatingBand;
  pedagogyRating: RatingBand;
  availabilityRating: RatingBand;
  rhythmRating: RatingBand;
};

export function hasAllRatings(
  r: {
    comprehensionRating: RatingBand | null | undefined;
    explanationRating: RatingBand | null | undefined;
    pedagogyRating: RatingBand | null | undefined;
    availabilityRating: RatingBand | null | undefined;
    rhythmRating: RatingBand | null | undefined;
  }
): r is FiveRatings {
  return (
    r.comprehensionRating != null &&
    r.explanationRating != null &&
    r.pedagogyRating != null &&
    r.availabilityRating != null &&
    r.rhythmRating != null
  );
}
