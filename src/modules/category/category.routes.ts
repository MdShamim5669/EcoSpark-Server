import { Router } from "express";
import { USER_ROLE } from "../../constants";
import { auth } from "../../middlewares/auth";
import { role } from "../../middlewares/role";
import { validateRequest } from "../../middlewares/validateRequest";
import { CategoryController } from "./category.controller";
import { CategoryValidation } from "./category.validation";

const router = Router();

// Public routes
router.get("/", CategoryController.getAllCategories);
router.get("/:id", CategoryController.getCategoryById);

// Admin routes
router.post(
  "/",
  auth,
  role(USER_ROLE.ADMIN),
  validateRequest(CategoryValidation.createCategorySchema),
  CategoryController.createCategory
);
router.patch(
  "/:id",
  auth,
  role(USER_ROLE.ADMIN),
  validateRequest(CategoryValidation.updateCategorySchema),
  CategoryController.updateCategory
);
router.delete("/:id", auth, role(USER_ROLE.ADMIN), CategoryController.deleteCategory);

export const CategoryRoutes = router;
