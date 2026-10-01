import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { clearAuthCookie, setAuthCookie } from "../../utils/cookies";
import { AuthService } from "./auth.service";

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.register(req.body);

  setAuthCookie(res, result.token);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body);

  setAuthCookie(res, result.token);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Logged in successfully",
    data: result,
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  clearAuthCookie(res);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Logged out successfully",
    data: null,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.getMe(req.user!.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Current user profile fetched successfully",
    data: result,
  });
});

export const AuthController = {
  register,
  login,
  logout,
  getMe,
};
