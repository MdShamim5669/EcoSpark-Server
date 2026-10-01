import { Response } from "express";

interface IResponseData<T> {
  statusCode?: number;
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const sendResponse = <T>(res: Response, responseData: IResponseData<T>): void => {
  const { statusCode = 200, success, message, data, meta } = responseData;
  res.status(statusCode).json({
    success,
    message,
    ...(meta && { meta }),
    ...(data !== undefined && { data }),
  });
};

export default sendResponse;
