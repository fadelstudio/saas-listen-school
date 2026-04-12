"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConnection = void 0;
const env_1 = require("./env");
exports.redisConnection = {
    host: env_1.env.REDIS_HOST,
    port: env_1.env.REDIS_PORT,
};
//# sourceMappingURL=redis.js.map