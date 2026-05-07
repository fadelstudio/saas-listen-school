export interface EvaluationCampaignFilters {
  classId?: string;
  campusId?: string;
  campusIds?: string[];
  scope?: 'CLASS' | 'CAMPUS' | 'SCHOOL';
  status?: string;
}
