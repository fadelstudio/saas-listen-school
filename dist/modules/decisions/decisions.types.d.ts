import { DecisionStatus, Priority } from '@prisma/client';
import { PaginatedResult } from '../../utils/pagination';
export type DecisionPriority = Priority;
export interface CreateDecisionInput {
    evaluationId?: string;
    reportId?: string;
    title: string;
    rationale?: string;
    priority?: DecisionPriority;
    responsible?: string;
    dueDate?: string;
}
export interface UpdateDecisionInput {
    title?: string;
    rationale?: string;
    priority?: DecisionPriority;
    responsible?: string;
    dueDate?: string;
}
export interface DecisionFilters {
    status?: DecisionStatus;
    deciderId?: string;
    priority?: DecisionPriority;
    campusIds?: string[];
    startDate?: string;
    endDate?: string;
}
export type PaginatedDecisions = PaginatedResult<Record<string, unknown>>;
//# sourceMappingURL=decisions.types.d.ts.map