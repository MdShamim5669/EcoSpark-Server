import { IdeaStatus } from "@prisma/client";
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { IdeaService } from "./idea.service";

const createIdea = catchAsync(async (req: Request, res: Response) => {
  const result = await IdeaService.createIdea(req.user!.id, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Idea created as draft successfully",
    data: result,
  });
});

const submitIdea = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await IdeaService.submitIdea(id, req.user!.id, req.user!.role);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Idea submitted for review successfully",
    data: result,
  });
});

const updateIdea = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await IdeaService.updateIdea(id, req.user!.id, req.user!.role, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Idea updated successfully",
    data: result,
  });
});

const deleteIdea = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await IdeaService.deleteIdea(id, req.user!.id, req.user!.role);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Idea deleted successfully",
    data: result,
  });
});

const approveIdea = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await IdeaService.approveIdea(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Idea approved successfully",
    data: result,
  });
});

const rejectIdea = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { feedback } = req.body;
  const result = await IdeaService.rejectIdea(id, feedback);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Idea rejected with feedback successfully",
    data: result,
  });
});

const getAllPublicIdeas = catchAsync(async (req: Request, res: Response) => {
  const result = await IdeaService.getAllPublicIdeas(req.query, req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Ideas fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getIdeaById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await IdeaService.getIdeaById(id, req.user);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Idea fetched successfully",
    data: result,
  });
});

const getMyIdeas = catchAsync(async (req: Request, res: Response) => {
  const result = await IdeaService.getMyIdeas(req.user!.id, req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "My ideas fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getTopIdeas = catchAsync(async (req: Request, res: Response) => {
  const result = await IdeaService.getTopIdeas();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Top voted ideas fetched successfully",
    data: result,
  });
});

const getAdminIdeas = catchAsync(async (req: Request, res: Response) => {
  const status = req.query.status as IdeaStatus | undefined;
  const result = await IdeaService.getAdminIdeas(status, req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin ideas list fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

export const IdeaController = {
  createIdea,
  submitIdea,
  updateIdea,
  deleteIdea,
  approveIdea,
  rejectIdea,
  getAllPublicIdeas,
  getIdeaById,
  getMyIdeas,
  getTopIdeas,
  getAdminIdeas,
};
