"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const env_1 = require("../core/config/env");
const { combine, timestamp, printf, colorize, errors, json } = winston_1.default.format;
// Human-readable format for development
const devFormat = combine(colorize({ all: true }), timestamp({ format: 'HH:mm:ss' }), errors({ stack: true }), printf(({ level, message, timestamp, stack, ...meta }) => {
    const extras = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}] ${stack ?? message}${extras}`;
}));
// Structured JSON format for production
const prodFormat = combine(timestamp(), errors({ stack: true }), json());
exports.logger = winston_1.default.createLogger({
    level: env_1.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: env_1.env.NODE_ENV === 'production' ? prodFormat : devFormat,
    transports: [new winston_1.default.transports.Console()],
});
//# sourceMappingURL=logger.js.map