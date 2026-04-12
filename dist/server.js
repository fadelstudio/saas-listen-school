"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./core/config/env"); // Validate env vars at startup — MUST be first
const app_1 = __importDefault(require("./app"));
const env_1 = require("./core/config/env");
const server = app_1.default.listen(env_1.env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env_1.env.PORT}`);
    console.log(`   Environment: ${env_1.env.NODE_ENV}`);
    console.log('documentation : http://localhost:3000/api-docs');
});
// Graceful shutdown
process.on("SIGTERM", () => {
    console.log("⚠️  SIGTERM received — shutting down gracefully");
    server.close(() => {
        console.log("✅ Server closed");
        process.exit(0);
    });
});
process.on("SIGINT", () => {
    console.log("⚠️  SIGINT received — shutting down gracefully");
    server.close(() => {
        console.log("✅ Server closed");
        process.exit(0);
    });
});
//# sourceMappingURL=server.js.map