import { Request, Response } from "express";
import httpStatus from "http-status";
import AppError from "../../errorHelpers/AppError";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AiService } from "./ai.service";

const askAdvisor = catchAsync(async (req: Request, res: Response) => {
  const { query, history, categoryId } = req.body;

  if (!query || typeof query !== "string" || !query.trim()) {
    throw new AppError(httpStatus.BAD_REQUEST, "A valid query string is required.");
  }

  const result = await AiService.askAdvisor({
    query: query.trim(),
    history,
    categoryId,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Eco-Advisor guidance generated successfully",
    data: result,
  });
});

const findSimilarIdeas = catchAsync(async (req: Request, res: Response) => {
  const { problemStatement, title, proposedSolution, limit } = req.body;

  if (!problemStatement || typeof problemStatement !== "string") {
    throw new AppError(httpStatus.BAD_REQUEST, "problemStatement is required to search for similar ideas.");
  }

  const result = await AiService.findSimilarIdeas({
    problemStatement,
    title,
    proposedSolution,
    limit: limit ? Number(limit) : 5,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Similar initiatives retrieved successfully",
    data: result,
  });
});

const getAiStatus = catchAsync(async (req: Request, res: Response) => {
  const statusInfo = await AiService.getSystemStatus();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "AI Advisor status retrieved successfully",
    data: statusInfo,
  });
});

const syncEmbeddings = catchAsync(async (req: Request, res: Response) => {
  const result = await AiService.syncEmbeddings();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Embeddings synchronized successfully",
    data: result,
  });
});

export const AiController = {
  askAdvisor,
  findSimilarIdeas,
  getAiStatus,
  syncEmbeddings,
};
