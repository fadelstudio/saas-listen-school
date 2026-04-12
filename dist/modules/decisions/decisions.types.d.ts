import { DecisionStatus } from '@prisma/client';
import { PaginatedResult } from '../../utils/pagination';
export type DecisionPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export interface CreateDecisionInput {
    evaluationId: string;
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
    startDate?: string;
    endDate?: string;
}
export type PaginatedDecisions = PaginatedResult<Record<string, unknown>>;
//# sourceMappingURL=decisions.types.d.ts.map