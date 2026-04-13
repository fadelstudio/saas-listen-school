"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../core/config/env"); // validate env vars at startup
const logger_1 = require("../utils/logger");
// Importing the processor starts the BullMQ worker.
require("./ai.processor");
logger_1.logger.info('Worker running (AI processor)');
//# sourceMappingURL=ai.worker.js.map