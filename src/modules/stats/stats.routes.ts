import { Router } from "express";
import { USER_ROLE } from "../../constants";
import { auth } from "../../middlewares/auth";
import { role } from "../../middlewares/role";
import { StatsController } from "./stats.controller";

const router = Router();

// Admin only stats route
router.get("/", auth, role(USER_ROLE.ADMIN), StatsController.getAdminStats);

export const StatsRoutes = router;
