import { z } from 'zod';
export declare const NotificationTypeEnum: z.ZodEnum<{
    AI_FAILURE: "AI_FAILURE";
    EVALUATION_CAMPAIGN: "EVALUATION_CAMPAIGN";
    EVALUATION_CAMPAIGN_REMINDER: "EVALUATION_CAMPAIGN_REMINDER";
    SYSTEM: "SYSTEM";
    BROADCAST: "BROADCAST";
    NEW_REPORT: "NEW_REPORT";
    REPORT_STATUS_CHANGED: "REPORT_STATUS_CHANGED";
    WELCOME: "WELCOME";
}>;
export declare const notificationsSchema: {
    sendBroadcast: z.ZodObject<{
        title: z.ZodString;
        message: z.ZodString;
        targetRoles: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            SUPERADMIN: "SUPERADMIN";
            ADMIN: "ADMIN";
            MANAGER: "MANAGER";
            AGENT: "AGENT";
            STUDENT: "STUDENT";
            VIEWER: "VIEWER";
            PROFESSOR: "PROFESSOR";
        }>>>;
        targetCampusIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
        targetClassIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
        targetUserIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
        url: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        attachments: z.ZodOptional<z.ZodAny>;
    }, z.core.$strip>;
    query: z.ZodObject<{
        page: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
        limit: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
        isRead: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<boolean | undefined, string | undefined>>;
        type: z.ZodOptional<z.ZodEnum<{
            AI_FAILURE: "AI_FAILURE";
            EVALUATION_CAMPAIGN: "EVALUATION_CAMPAIGN";
            EVALUATION_CAMPAIGN_REMINDER: "EVALUATION_CAMPAIGN_REMINDER";
            SYSTEM: "SYSTEM";
            BROADCAST: "BROADCAST";
            NEW_REPORT: "NEW_REPORT";
            REPORT_STATUS_CHANGED: "REPORT_STATUS_CHANGED";
            WELCOME: "WELCOME";
        }>>;
    }, z.core.$strip>;
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
};
//# sourceMappingURL=notifications.schema.d.ts.map