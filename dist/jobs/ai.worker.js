"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("../core/config/env"); // validate env vars at startup
const logger_1 = require("../utils/logger");
// Importing the processor starts the BullMQ worker.
require("./ai.processor");
const campaign_reminder_worker_1 = require("./campaign-reminder.worker");
const express_1 = __importDefault(require("express"));
logger_1.logger.info('Worker running (AI processor)');
(0, campaign_reminder_worker_1.startCampaignReminderLoop)();
// Minimal health-check server to satisfy platforms like Railway/Render
const healthApp = (0, express_1.default)();
const port = process.env.WORKER_PORT || 8081; // Use 8081 as fallback for worker, avoid clashing with API on PORT
healthApp.get(['/', '/health'], (_req, res) => res.status(200).send('Worker is healthy'));
healthApp.listen(port, () => {
    logger_1.logger.info(`Worker health-check server listening on port ${port}`);
});
//# sourceMappingURL=ai.worker.js.map