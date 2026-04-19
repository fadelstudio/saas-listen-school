import "./core/config/env"; // Validate env vars at startup — MUST be first
import type { Server } from "http";
import app from "./app";
import { env } from "./core/config/env";
import { validateTenantEnvOnStartup } from "./core/config/validateTenantEnv";
import { purgeStaleUnverifiedRegistrations } from "./jobs/purgePendingRegistrations.job";

const PURGE_INTERVAL_MS = 15 * 60 * 1000;

void validateTenantEnvOnStartup()
  .then(async () => {
    const runPurge = (): void => {
      void purgeStaleUnverifiedRegistrations()
        .then((n) => {
          if (n > 0) {
            console.log(`🧹 Purge inscriptions non vérifiées: ${n} compte(s) supprimé(s)`);
          }
        })
        .catch((err) => console.error("purgeStaleUnverifiedRegistrations:", err));
    };
    runPurge();
    setInterval(runPurge, PURGE_INTERVAL_MS);

    const server = app.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT}`);
      console.log(`   Environment: ${env.NODE_ENV}`);
      console.log(`   Documentation: http://localhost:${env.PORT}/api-docs`);
    });

    function shutdown(s: Server, signal: string): void {
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
