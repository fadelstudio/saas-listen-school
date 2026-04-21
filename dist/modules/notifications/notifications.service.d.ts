export type NotificationType = 'AI_FAILURE' | 'EVALUATION_CAMPAIGN' | 'EVALUATION_CAMPAIGN_REMINDER' | 'SYSTEM';
export declare const notificationService: {
    /**
     * Crée une notification.
     * - userId : null = notification globale (visible par tous les utilisateurs de l'école)
     * - schoolId : permet d'isoler les notifications globales par école
     */
    create(data: {
        title: string;
        message: string;
        type: NotificationType;
        userId?: string;
        campaignId?: string;
        schoolId?: string;
    }): Promise<{
        type: string;
        message: string;
        id: string;
        createdAt: Date;
        schoolId: string | null;
        title: string;
        campaignId: string | null;
        userId: string | null;
        isRead: boolean;
    }>;
    /**
     * Récupère les notifications pour un utilisateur donné, isolées par école.
     * Retourne :
     *  - Les notifications adressées directement à l'utilisateur (userId = userId)
     *  - Les notifications globales de l'école (userId = null AND schoolId = schoolId)
     *  - Les notifications globales système pures (userId = null AND schoolId = null)
     */
    getAllForUser(userId: string, schoolId: string, opts?: {
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
            schoolId: string | null;
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