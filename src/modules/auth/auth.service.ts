import { Role } from "@prisma/client";
import { config } from "../../config";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { comparePassword, hashPassword } from "../../utils/hash";
import { generateToken } from "../../utils/jwt";

const register = async (payload: { name: string; email: string; password: string }) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  const passwordHash = await hashPassword(payload.password);

  const newUser = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      passwordHash,
      role: Role.MEMBER,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      isActive: true,
      createdAt: true,
    },
  });

  const token = generateToken(
    { id: newUser.id, email: newUser.email, role: newUser.role },
    config.jwt.secret,
    config.jwt.expiresIn
  );

  return { user: newUser, token };
};

const login = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account is deactivated. Please contact support.");
  }

  const isPasswordMatched = await comparePassword(payload.password, user.passwordHash);
  if (!isPasswordMatched) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    config.jwt.expiresIn
  );

  const { passwordHash: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

export const AuthService = {
  register,
  login,
  getMe,
};
