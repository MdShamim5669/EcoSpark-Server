import { DEFAULT_LIMIT, DEFAULT_PAGE } from "../constants";

export interface IPaginationOptions {
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IPaginationResult {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export const calculatePagination = (options: IPaginationOptions): IPaginationResult => {
  const page = Number(options.page || DEFAULT_PAGE);
  const limit = Number(options.limit || DEFAULT_LIMIT);
  const skip = (page - 1) * limit;

  const sortBy = options.sortBy || "createdAt";
  const sortOrder = options.sortOrder || "desc";

  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  };
};
