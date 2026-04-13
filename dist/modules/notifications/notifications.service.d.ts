export declare const notificationService: {
    create(data: {
        title: string;
        message: string;
        type: "AI_FAILURE" | "EVALUATION_CAMPAIGN" | "SYSTEM";
        userId?: string;
    }): Promise<{
        type: string;
        message: string;
        id: string;
        createdAt: Date;
        userId: string | null;
        title: string;
        isRead: boolean;
    }>;
    getAllForUser(userId: string): Promise<{
        type: string;
        message: string;
        id: string;
        createdAt: Date;
        userId: string | null;
        title: string;
        isRead: boolean;
    }[]>;
    markAsRead(id: string): Promise<{
        type: string;
        message: string;
        id: string;
        createdAt: Date;
        userId: string | null;
        title: string;
        isRead: boolean;
    }>;
};
//# sourceMappingURL=notifications.service.d.ts.map