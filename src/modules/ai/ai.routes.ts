import { Router } from "express";
import { USER_ROLE } from "../../constants";
import { auth, optionalAuth } from "../../middlewares/auth";
import { role } from "../../middlewares/role";
import { AiController } from "./ai.controller";

const router = Router();

// Public routes for AI queries & advice (allows guest & authenticated users)
router.post("/ask", optionalAuth, AiController.askAdvisor);
router.post("/similar", optionalAuth, AiController.findSimilarIdeas);
router.get("/status", AiController.getAiStatus);

// Admin-only route to force re-index vector documents & embeddings
router.post(
  "/sync",
  auth,
  role(USER_ROLE.ADMIN),
  AiController.syncEmbeddings
);

export const AiRoutes = router;
