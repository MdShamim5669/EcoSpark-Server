import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { WatchlistService } from "./watchlist.service";

const addToWatchlist = catchAsync(async (req: Request, res: Response) => {
  const { ideaId } = req.body;
  const result = await WatchlistService.addToWatchlist(req.user!.id, ideaId);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Added to watchlist successfully",
    data: result,
  });
});

const removeFromWatchlist = catchAsync(async (req: Request, res: Response) => {
  const { ideaId } = req.params;
  const result = await WatchlistService.removeFromWatchlist(req.user!.id, ideaId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Removed from watchlist successfully",
    data: result,
  });
});

const getMyWatchlist = catchAsync(async (req: Request, res: Response) => {
  const result = await WatchlistService.getMyWatchlist(req.user!.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Watchlist fetched successfully",
    data: result,
  });
});

export const WatchlistController = {
  addToWatchlist,
  removeFromWatchlist,
  getMyWatchlist,
};
