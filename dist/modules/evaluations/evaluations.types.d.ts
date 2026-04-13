import { EvaluationStatus } from '@prisma/client';
import { PaginatedResult } from '../../utils/pagination';
export interface CreateEvaluationInput {
    reportId?: string;
    professorId: string;
    moduleId: string;
    classId: string;
    score?: number;
    clarityScore?: number;
    pedagogyScore?: number;
    availabilityScore?: number;
    rhythmScore?: number;
    comment?: string;
    isAnonymous?: boolean;
}
export interface UpdateEvaluationInput {
    score?: number;
    clarityScore?: number;
    pedagogyScore?: number;
    availabilityScore?: number;
    rhythmScore?: number;
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
    averageClarityScore: number | null;
    averagePedagogyScore: number | null;
    averageAvailabilityScore: number | null;
    averageRhythmScore: number | null;
    distribution: Record<string, number>;
}
export type PaginatedEvaluations = PaginatedResult<Record<string, unknown>>;
//# sourceMappingURL=evaluations.types.d.ts.map