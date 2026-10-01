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
    origin: [config.clientUrl, "http://localhost:3000"],
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
