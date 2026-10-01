import { Prisma } from "@prisma/client";
import { IGenericErrorResponse } from "./HandleZodError";

export const handlePrismaClientError = (
  error: Prisma.PrismaClientKnownRequestError
): IGenericErrorResponse => {
  let statusCode = 400;
  let message = "Database Error";
  let errorMessages = [
    {
      path: "",
      message: error.message,
    },
  ];

  if (error.code === "P2002") {
    statusCode = 409;
    message = "Duplicate entry detected";
    errorMessages = [
      {
        path: error.meta?.target ? String(error.meta.target) : "",
        message: "A record with this value already exists.",
      },
    ];
  } else if (error.code === "P2025") {
    statusCode = 404;
    message = "Record not found";
    errorMessages = [
      {
        path: "",
        message: (error.meta?.cause as string) || "Record not found",
      },
    ];
  } else if (error.code === "P2003") {
    statusCode = 400;
    message = "Foreign key constraint violation";
    errorMessages = [
      {
        path: error.meta?.field_name ? String(error.meta.field_name) : "",
        message: "Invalid relation ID provided",
      },
    ];
  }

  return {
    statusCode,
    message,
    errorMessages,
  };
};

export const handlePrismaError = handlePrismaClientError;

export default handlePrismaClientError;
