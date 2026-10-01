import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { CommentController } from "./comment.controller";
import { CommentValidation } from "./comment.validation";

const router = Router();

// Public: view comments of an idea
router.get("/idea/:ideaId", CommentController.getCommentsByIdea);

// Member: add comment to an idea
router.post(
  "/idea/:ideaId",
  auth,
  validateRequest(CommentValidation.createCommentSchema),
  CommentController.createComment
);

// Member/Admin: delete comment
router.delete("/:id", auth, CommentController.deleteComment);

export const CommentRoutes = router;
