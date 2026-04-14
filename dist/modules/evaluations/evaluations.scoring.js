"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bandToPoints = bandToPoints;
exports.computeScoreFromRatings = computeScoreFromRatings;
exports.hasAllRatings = hasAllRatings;
const BAND_TO_POINTS = {
    VERY_POOR: 1,
    POOR: 2,
    FAIR: 3,
    GOOD: 4,
    EXCELLENT: 5,
};
function bandToPoints(b) {
    return BAND_TO_POINTS[b];
}
/**
 * Five criteria on a 1–5 scale → average × 4 → score in [4, 20].
 */
function computeScoreFromRatings(input) {
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
function hasAllRatings(r) {
    return (r.comprehensionRating != null &&
        r.explanationRating != null &&
        r.pedagogyRating != null &&
        r.availabilityRating != null &&
        r.rhythmRating != null);
}
//# sourceMappingURL=evaluations.scoring.js.map