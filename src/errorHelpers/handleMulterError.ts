import { MulterError } from "multer";
import { IGenericErrorResponse } from "./HandleZodError";

export const handleMulterError = (error: MulterError): IGenericErrorResponse => {
  let statusCode = 400;
  let message = "File Upload Error";
  let errorMessage = error.message;

  if (error.code === "LIMIT_FILE_SIZE") {
    errorMessage = "File size exceeds the 5MB limit";
  } else if (error.code === "LIMIT_UNEXPECTED_FILE") {
    errorMessage = `Too many files or unexpected field '${error.field}'`;
  }

  return {
    statusCode,
    message,
    errorMessages: [
      {
        path: error.field || "file",
        message: errorMessage,
      },
    ],
  };
};

export default handleMulterError;
