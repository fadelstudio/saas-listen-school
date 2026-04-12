export interface AiJobFilters {
  status?: string;
  jobType?: string;
  reportId?: string;
  evaluationId?: string;
  decisionId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ChatInput {
  question: string;
}

export interface SynthesisInput {
  startDate?: string;
  endDate?: string;
}
