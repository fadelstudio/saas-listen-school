import { Worker } from 'bullmq';
export interface AiAnalysisPayload {
    type: 'report-analysis' | 'evaluation-scoring' | 'decision-suggestion' | 'global-synthesis' | 'chat-query';
    reportId?: string;
    evaluationId?: string;
    decisionId?: string;
    question?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
}
declare const aiWorker: Worker<AiAnalysisPayload, any, string>;
export default aiWorker;
//# sourceMappingURL=ai.processor.d.ts.map