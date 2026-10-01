import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { CommentService } from "./comment.service";

const createComment = catchAsync(async (req: Request, res: Response) => {
  const ideaId = req.params.id || req.params.ideaId;
  const result = await CommentService.createComment(req.user!.id, ideaId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Comment added successfully",
    data: result,
  });
});

const getCommentsByIdea = catchAsync(async (req: Request, res: Response) => {
  const ideaId = req.params.id || req.params.ideaId;
  const result = await CommentService.getCommentsByIdea(ideaId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Comments fetched successfully",
    data: result,
  });
});

const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CommentService.deleteComment(id, req.user!.id, req.user!.role);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Comment deleted successfully",
    data: result,
  });
});

export const CommentController = {
  createComment,
  getCommentsByIdea,
  deleteComment,
};
