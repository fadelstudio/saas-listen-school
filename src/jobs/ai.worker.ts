import '../core/config/env'; // validate env vars at startup
import { logger } from '../utils/logger';

// Importing the processor starts the BullMQ worker.
import './ai.processor';
import './mail.worker';
import { startCampaignReminderLoop } from './campaign-reminder.worker';

import express from 'express';

logger.info('Worker running (AI processor)');
startCampaignReminderLoop();

// Minimal health-check server to satisfy platforms like Railway/Render
const healthApp = express();
const port = process.env.PORT || 8081; // Use PORT for Railway health check
healthApp.get(['/', '/health'], (_req, res) => res.status(200).send('Worker is healthy'));
healthApp.listen(port, () => {
    logger.info(`Worker health-check server listening on port ${port}`);
});
