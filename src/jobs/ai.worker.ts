import '../core/config/env'; // validate env vars at startup
import { logger } from '../utils/logger';

// Importing the processor starts the BullMQ worker.
import './ai.processor';
import { startCampaignReminderLoop } from './campaign-reminder.worker';

logger.info('Worker running (AI processor)');
startCampaignReminderLoop();

