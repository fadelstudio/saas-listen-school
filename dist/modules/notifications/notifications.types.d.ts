import { Role } from '@prisma/client';
export type NotificationType = 'AI_FAILURE' | 'EVALUATION_CAMPAIGN' | 'EVALUATION_CAMPAIGN_REMINDER' | 'SYSTEM' | 'BROADCAST' | 'DECISION_TAKEN' | 'NEW_REPORT' | 'REPORT_STATUS_CHANGED' | 'CAMPAIGN_CLOSED' | 'ANALYTICS_READY' | 'LOGIN_WELCOME';
export interface SendBroadcastInput {
    title: string;
    message: string;
    targetRoles?: Role[];
    targetCampusIds?: string[];
    targetClassIds?: string[];
    targetUserIds?: string[];
    url?: string;
    attachments?: any;
}
export interface NotificationFilters {
    isRead?: boolean;
    type?: NotificationType;
}
//# sourceMappingURL=notifications.types.d.ts.map