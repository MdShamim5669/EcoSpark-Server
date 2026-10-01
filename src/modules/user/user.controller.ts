import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { UserService } from "./user.service";

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.updateProfile(req.user!.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;
  const result = await UserService.updateUserStatus(id, isActive);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `User status updated to ${isActive ? "active" : "inactive"} successfully`,
    data: result,
  });
});

const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  const result = await UserService.updateUserRole(id, role);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `User role updated to ${role} successfully`,
    data: result,
  });
});

export const UserController = {
  updateProfile,
  getAllUsers,
  updateUserStatus,
  updateUserRole,
};
