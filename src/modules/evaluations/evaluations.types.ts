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
  uti?: string; // Short for targetDeviceUti
  deviceMetadata?: Record<string, any>;
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
  professorId?: string;
  moduleId?: string;
  classId?: string;
  campusId?: string;
  startDate?: string;
  endDate?: string;
}

export interface EvaluationStats {
  totalCount: number;
  averageScore: number | null;
  averageAiScore: number | null;
  avgComprehension?: number | null;
  avgExplanation?: number | null;
  avgPedagogy?: number | null;
  avgAvailability?: number | null;
  avgRhythm?: number | null;
  sentimentDistribution?: {
    positive: number;
    neutral: number;
    negative: number;
  };
  rankings?: {
    top: { name: string; role: string; score: number; count: number }[];
    bottom: { name: string; role: string; score: number; count: number }[];
  };
}

export type PaginatedEvaluations = PaginatedResult<Record<string, unknown>>;
