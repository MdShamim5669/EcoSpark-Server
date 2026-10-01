import { Role } from "@prisma/client";

export interface IRequestUser {
  id: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export default IRequestUser;
