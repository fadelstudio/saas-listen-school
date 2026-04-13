import '../core/config/env'; // validate env vars at startup
import { logger } from '../utils/logger';

// Importing the processor starts the BullMQ worker.
import './ai.processor';

logger.info('Worker running (AI processor)');

