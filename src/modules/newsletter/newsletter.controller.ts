import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { NewsletterService } from "./newsletter.service";

const subscribe = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await NewsletterService.subscribe(email);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Subscribed to newsletter successfully",
    data: result,
  });
});

const getAllSubscribers = catchAsync(async (req: Request, res: Response) => {
  const result = await NewsletterService.getAllSubscribers();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subscribers fetched successfully",
    data: result,
  });
});

export const NewsletterController = {
  subscribe,
  getAllSubscribers,
};
