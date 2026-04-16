export type NotificationType = 'AI_FAILURE' | 'EVALUATION_CAMPAIGN' | 'EVALUATION_CAMPAIGN_REMINDER' | 'SYSTEM';
export declare const notificationService: {
    create(data: {
        title: string;
        message: string;
        type: NotificationType;
        userId?: string;
        campaignId?: string;
    }): Promise<{
        type: string;
        message: string;
        id: string;
        createdAt: Date;
        title: string;
        campaignId: string | null;
        userId: string | null;
        isRead: boolean;
    }>;
    getAllForUser(userId: string, opts?: {
        isRead?: boolean;
        type?: NotificationType;
        skip?: number;
        limit?: number;
    }): Promise<{
        items: {
            type: string;
            message: string;
            id: string;
            createdAt: Date;
            title: string;
            campaignId: string | null;
            userId: string | null;
            isRead: boolean;
        }[];
        total: number;
    }>;
    markAsReadForUser(userId: string, id: string): Promise<void>;
};
//# sourceMappingURL=notifications.service.d.ts.map