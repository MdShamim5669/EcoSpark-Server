import { Router } from "express";
import { USER_ROLE } from "../../constants";
import { auth, optionalAuth } from "../../middlewares/auth";
import { role } from "../../middlewares/role";
import { validateRequest } from "../../middlewares/validateRequest";
import { CommentController } from "../comment/comment.controller";
import { CommentValidation } from "../comment/comment.validation";
import { VoteController } from "../vote/vote.controller";
import { VoteValidation } from "../vote/vote.validation";
import { IdeaController } from "./idea.controller";
import { IdeaValidation } from "./idea.validation";

const router = Router();

// 1. Static / Predefined public routes
router.get("/", IdeaController.getAllPublicIdeas);
router.get("/top", IdeaController.getTopIdeas);

// 2. Member routes (auth required)
router.get("/my", auth, IdeaController.getMyIdeas);
router.post(
  "/",
  auth,
  validateRequest(IdeaValidation.createIdeaSchema),
  IdeaController.createIdea
);

// 3. Admin moderation routes (MUST be defined before /:id to avoid route shadowing)
router.get("/admin/list", auth, role(USER_ROLE.ADMIN), IdeaController.getAdminIdeas);
router.patch("/admin/:id/approve", auth, role(USER_ROLE.ADMIN), IdeaController.approveIdea);
router.patch(
  "/admin/:id/reject",
  auth,
  role(USER_ROLE.ADMIN),
  validateRequest(IdeaValidation.rejectIdeaSchema),
  IdeaController.rejectIdea
);

// 4. Nested Idea actions (PRD endpoints: /ideas/:id/vote, /ideas/:id/comments)
router.put(
  "/:id/vote",
  auth,
  validateRequest(VoteValidation.castVoteSchema),
  VoteController.castVote
);
router.delete("/:id/vote", auth, VoteController.removeVote);
router.get("/:id/vote/status", auth, VoteController.getUserVoteStatus);

router.get("/:id/comments", CommentController.getCommentsByIdea);
router.post(
  "/:id/comments",
  auth,
  validateRequest(CommentValidation.createCommentSchema),
  CommentController.createComment
);

// 5. Idea lifecycle routes
router.patch("/:id/submit", auth, IdeaController.submitIdea);
router.patch(
  "/:id",
  auth,
  validateRequest(IdeaValidation.updateIdeaSchema),
  IdeaController.updateIdea
);
router.delete("/:id", auth, IdeaController.deleteIdea);

// 6. Specific idea details with paywall check (optionalAuth passes authenticated user if present)
router.get("/:id", optionalAuth, IdeaController.getIdeaById);

export const IdeaRoutes = router;
