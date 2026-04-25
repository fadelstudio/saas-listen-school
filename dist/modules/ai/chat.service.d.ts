interface ConvContext {
    lastSql?: string;
    lastQuestion?: string;
    lastDataSummary?: string;
}
export interface ChartData {
    type: 'bar' | 'line' | 'pie' | 'table';
    title: string;
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
        color?: string;
    }>;
}
export declare const chatService: {
    ensureSchema(): Promise<void>;
    getConversations(schoolId: string, userId: string): Promise<any[]>;
    getMessages(conversationId: string): Promise<any[]>;
    createConversation(schoolId: string, userId: string, firstMessage: string): Promise<{
        id: any;
        title: string;
    }>;
    saveConversation(conversationId: string): Promise<{
        saved: boolean;
    }>;
    deleteConversation(conversationId: string): Promise<{
        deleted: boolean;
    }>;
    addMessage(conversationId: string, role: "user" | "assistant", content: string): Promise<{
        id: any;
        role: "user" | "assistant";
        content: string;
    }>;
    loadSqlContext(convId: string): Promise<ConvContext>;
    saveSqlContext(convId: string, ctx: ConvContext): Promise<void>;
    askDirect(question: string, schoolId: string, userId: string, conversationId?: string): Promise<{
        answer: string;
        conversationId: string;
        usedDB: boolean;
        schoolName: string;
        chartData: ChartData | null;
    }>;
};
export {};
//# sourceMappingURL=chat.service.d.ts.map