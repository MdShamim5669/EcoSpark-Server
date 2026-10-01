import { Router } from "express";
import { USER_ROLE } from "../../constants";
import { auth } from "../../middlewares/auth";
import { role } from "../../middlewares/role";
import { validateRequest } from "../../middlewares/validateRequest";
import { IdeaController } from "../idea/idea.controller";
import { IdeaValidation } from "../idea/idea.validation";
import { UserController } from "../user/user.controller";
import { UserValidation } from "../user/user.validation";

const router = Router();

// Protect all admin routes with auth and ADMIN role
router.use(auth, role(USER_ROLE.ADMIN));

// PRD Section 12: Admin Ideas moderation
router.get("/ideas", IdeaController.getAdminIdeas);
router.patch("/ideas/:id/approve", IdeaController.approveIdea);
router.patch(
  "/ideas/:id/reject",
  validateRequest(IdeaValidation.rejectIdeaSchema),
  IdeaController.rejectIdea
);

// PRD Section 12: Admin User management
router.get("/users", UserController.getAllUsers);
router.patch(
  "/users/:id/status",
  validateRequest(UserValidation.updateUserStatusSchema),
  UserController.updateUserStatus
);
router.patch(
  "/users/:id/role",
  validateRequest(UserValidation.updateUserRoleSchema),
  UserController.updateUserRole
);

export const AdminRoutes = router;
