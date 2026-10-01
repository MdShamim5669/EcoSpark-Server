import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { VoteService } from "./vote.service";

const castVote = catchAsync(async (req: Request, res: Response) => {
  const ideaId = req.params.id || req.params.ideaId;
  const { type } = req.body;
  const result = await VoteService.castVote(req.user!.id, ideaId, type);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Vote cast as ${type} successfully`,
    data: result,
  });
});

const removeVote = catchAsync(async (req: Request, res: Response) => {
  const ideaId = req.params.id || req.params.ideaId;
  const result = await VoteService.removeVote(req.user!.id, ideaId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Vote removed successfully",
    data: result,
  });
});

const getUserVoteStatus = catchAsync(async (req: Request, res: Response) => {
  const ideaId = req.params.id || req.params.ideaId;
  const result = await VoteService.getUserVoteStatus(req.user!.id, ideaId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User vote status fetched successfully",
    data: result,
  });
});

export const VoteController = {
  castVote,
  removeVote,
  getUserVoteStatus,
};
