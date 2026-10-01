import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { StatsService } from "./stats.service";

const getAdminStats = catchAsync(async (req: Request, res: Response) => {
  const result = await StatsService.getAdminStats();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin statistics fetched successfully",
    data: result,
  });
});

export const StatsController = {
  getAdminStats,
};
