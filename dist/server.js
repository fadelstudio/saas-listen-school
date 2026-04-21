"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./core/config/env"); // Validate env vars at startup — MUST be first
const app_1 = __importDefault(require("./app"));
const env_1 = require("./core/config/env");
const validateTenantEnv_1 = require("./core/config/validateTenantEnv");
const purgePendingRegistrations_job_1 = require("./jobs/purgePendingRegistrations.job");
const PURGE_INTERVAL_MS = 15 * 60 * 1000;
void (0, validateTenantEnv_1.validateTenantEnvOnStartup)()
    .then(async () => {
    const runPurge = () => {
        void (0, purgePendingRegistrations_job_1.purgeStaleUnverifiedRegistrations)()
            .then((n) => {
            if (n > 0) {
                console.log(`🧹 Purge inscriptions non vérifiées: ${n} compte(s) supprimé(s)`);
            }
        })
            .catch((err) => console.error("purgeStaleUnverifiedRegistrations:", err));
    };
    runPurge();
    setInterval(runPurge, PURGE_INTERVAL_MS);
    const server = app_1.default.listen(env_1.env.PORT, () => {
        console.log(`🚀 Server running on http://localhost:${env_1.env.PORT}`);
        console.log(`   Environment: ${env_1.env.NODE_ENV}`);
        console.log(`   Documentation: http://localhost:${env_1.env.PORT}/api-docs`);
    });
    function shutdown(s, signal) {
        console.log(`⚠️  ${signal} received — shutting down gracefully`);
        s.close(() => {
            console.log("✅ Server closed");
            process.exit(0);
        });
    }
    process.on("SIGTERM", () => shutdown(server, "SIGTERM"));
    process.on("SIGINT", () => shutdown(server, "SIGINT"));
})
    .catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map