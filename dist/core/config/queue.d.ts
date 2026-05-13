import { Queue } from "bullmq";
export declare const QUEUE_NAMES: {
    readonly AI_ANALYSIS: "ai-analysis";
    readonly EMAIL_SEND: "email-send";
};
export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
export declare const jobQueue: Queue<any, any, string, any, any, string>;
export declare const mailQueue: Queue<any, any, string, any, any, string>;
//# sourceMappingURL=queue.d.ts.map