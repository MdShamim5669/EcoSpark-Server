import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import path from "path";
import { config } from "./config";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";
import { AppRouter } from "./routes";

const app: Application = express();

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-side fetch)
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        config.clientUrl,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
      ];
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".onrender.com")
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Allow client requests
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// Serve uploaded static files
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "EcoSpark Hub Backend Server is live and operational",
    version: "1.0.0",
    apiBase: "/api/v1",
    healthCheck: "/health",
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    message: "EcoSpark Hub API is healthy and operational",
    timestamp: new Date().toISOString(),
  });
});

// Mount API v1 routes
app.use("/api/v1", AppRouter);

// Error handling middlewares
app.use(notFound);
app.use(globalErrorHandler);

export default app;
