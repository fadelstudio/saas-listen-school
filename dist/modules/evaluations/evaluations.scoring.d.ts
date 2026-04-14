import { RatingBand } from '@prisma/client';
export declare function bandToPoints(b: RatingBand): number;
/**
 * Five criteria on a 1–5 scale → average × 4 → score in [4, 20].
 */
export declare function computeScoreFromRatings(input: {
    comprehensionRating: RatingBand;
    explanationRating: RatingBand;
    pedagogyRating: RatingBand;
    availabilityRating: RatingBand;
    rhythmRating: RatingBand;
}): number;
export type FiveRatings = {
    comprehensionRating: RatingBand;
    explanationRating: RatingBand;
    pedagogyRating: RatingBand;
    availabilityRating: RatingBand;
    rhythmRating: RatingBand;
};
export declare function hasAllRatings(r: {
    comprehensionRating: RatingBand | null | undefined;
    explanationRating: RatingBand | null | undefined;
    pedagogyRating: RatingBand | null | undefined;
    availabilityRating: RatingBand | null | undefined;
    rhythmRating: RatingBand | null | undefined;
}): r is FiveRatings;
//# sourceMappingURL=evaluations.scoring.d.ts.map