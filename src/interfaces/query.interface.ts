export interface IQueryConfig {
  searchableFields?: string[];
  filterableFields?: string[];
}

export interface IQueryParams {
  searchTerm?: string;
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  fields?: string;
  include?: string;
  [key: string]: unknown;
}

export interface IQueryResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PrismaModelDelegate {
  findMany: (args?: any) => Promise<any>;
  count: (args?: any) => Promise<number>;
}

export interface PrismaFindManyArgs {
  where?: Record<string, unknown>;
  include?: Record<string, unknown>;
  select?: Record<string, boolean | Record<string, unknown>>;
  orderBy?: Record<string, unknown> | Record<string, unknown>[];
  skip?: number;
  take?: number;
}

export interface PrismaCountArgs {
  where?: Record<string, unknown>;
  select?: Record<string, boolean | Record<string, unknown>>;
}

export interface PrismaStringFilter {
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  equals?: string;
  mode?: "default" | "insensitive";
  not?: string | PrismaStringFilter;
  in?: string[];
  notIn?: string[];
}

export interface PrismaNumberFilter {
  equals?: number;
  in?: number[];
  notIn?: number[];
  lt?: number;
  lte?: number;
  gt?: number;
  gte?: number;
  not?: number | PrismaNumberFilter;
}

export interface PrismaWhereConditions extends Record<string, unknown> {
  AND?: Record<string, unknown>[];
  OR?: Record<string, unknown>[];
  NOT?: Record<string, unknown>[];
}
