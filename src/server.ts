import "./core/config/env"; // Validate env vars at startup — MUST be first
import app from "./app";
import { env } from "./core/config/env";

const server = app.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   Documentation: http://localhost:${env.PORT}/api-docs`);
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
