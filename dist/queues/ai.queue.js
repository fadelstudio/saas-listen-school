"use strict";
// Compatibility wrapper to match requested structure.
// We keep the existing implementation in src/core/config/queue.ts unchanged.
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUEUE_NAMES = exports.aiQueue = void 0;
var queue_1 = require("../core/config/queue");
Object.defineProperty(exports, "aiQueue", { enumerable: true, get: function () { return queue_1.jobQueue; } });
Object.defineProperty(exports, "QUEUE_NAMES", { enumerable: true, get: function () { return queue_1.QUEUE_NAMES; } });
//# sourceMappingURL=ai.queue.js.map