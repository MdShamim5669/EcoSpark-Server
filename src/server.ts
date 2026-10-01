import { Server } from "http";
import app from "./app";
import { config } from "./config";
import { prisma } from "./config/prisma";

let server: Server;

async function bootstrap() {
  try {
    // Check database connection
    await prisma.$connect();
    console.log("🐘 PostgreSQL database connected successfully via Prisma");

    server = app.listen(config.port, () => {
      console.log(`🚀 EcoSpark Hub Server running on port ${config.port} in ${config.env} mode`);
      console.log(`📡 Health check available at: http://localhost:${config.port}/health`);
      console.log(`🌐 API Base URL: http://localhost:${config.port}/api/v1`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }

  const exitHandler = () => {
    if (server) {
      server.close(() => {
        console.log("Server closed");
      });
    }
    process.exit(1);
  };

  const unexpectedErrorHandler = (error: unknown) => {
    console.error("Unexpected error caught:", error);
    exitHandler();
  };

  process.on("uncaughtException", unexpectedErrorHandler);
  process.on("unhandledRejection", unexpectedErrorHandler);

  process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down gracefully...");
    if (server) {
      server.close();
    }
  });
}

bootstrap();
