import { ZodError } from "zod";
import { IGenericErrorMessage, IGenericErrorResponse } from "../interfaces/error.interface";

export { IGenericErrorMessage, IGenericErrorResponse };

export const handleZodError = (error: ZodError): IGenericErrorResponse => {
  const errorMessages: IGenericErrorMessage[] = error.issues.map((issue) => {
    return {
      path: issue.path[issue.path.length - 1],
      message: issue.message,
    };
  });

  const statusCode = 400;

  return {
    statusCode,
    message: "Validation Error",
    errorMessages,
  };
};

export const HandleZodError = handleZodError;

export default handleZodError;
