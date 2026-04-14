import { EvaluationStatus, RatingBand } from '@prisma/client';
import { PaginatedResult } from '../../utils/pagination';
export interface CreateEvaluationInput {
    reportId?: string;
    professorId: string;
    moduleId: string;
    classId: string;
    comprehensionRating?: RatingBand;
    explanationRating?: RatingBand;
    pedagogyRating?: RatingBand;
    availabilityRating?: RatingBand;
    rhythmRating?: RatingBand;
    comment?: string;
    isAnonymous?: boolean;
}
export interface UpdateEvaluationInput {
    comprehensionRating?: RatingBand;
    explanationRating?: RatingBand;
    pedagogyRating?: RatingBand;
    availabilityRating?: RatingBand;
    rhythmRating?: RatingBand;
    comment?: string;
}
export interface EvaluationFilters {
    status?: EvaluationStatus;
    evaluatorId?: string;
    reportId?: string;
    startDate?: string;
    endDate?: string;
}
export interface EvaluationStats {
    totalCount: number;
    averageScore: number | null;
    averageAiScore: number | null;
}
export type PaginatedEvaluations = PaginatedResult<Record<string, unknown>>;
//# sourceMappingURL=evaluations.types.d.ts.map