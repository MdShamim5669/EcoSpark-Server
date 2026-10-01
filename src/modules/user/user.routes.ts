import { Router } from "express";
import { USER_ROLE } from "../../constants";
import { auth } from "../../middlewares/auth";
import { role } from "../../middlewares/role";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.validation";

const router = Router();

// Member profile update
router.patch(
  "/profile",
  auth,
  validateRequest(UserValidation.updateProfileSchema),
  UserController.updateProfile
);

// Admin user management
router.get("/", auth, role(USER_ROLE.ADMIN), UserController.getAllUsers);
router.patch(
  "/:id/status",
  auth,
  role(USER_ROLE.ADMIN),
  validateRequest(UserValidation.updateUserStatusSchema),
  UserController.updateUserStatus
);
router.patch(
  "/:id/role",
  auth,
  role(USER_ROLE.ADMIN),
  validateRequest(UserValidation.updateUserRoleSchema),
  UserController.updateUserRole
);

export const UserRoutes = router;
