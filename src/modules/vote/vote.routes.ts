import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { VoteController } from "./vote.controller";
import { VoteValidation } from "./vote.validation";

const router = Router();

router.put(
  "/:ideaId",
  auth,
  validateRequest(VoteValidation.castVoteSchema),
  VoteController.castVote
);
router.delete("/:ideaId", auth, VoteController.removeVote);
router.get("/:ideaId/status", auth, VoteController.getUserVoteStatus);

export const VoteRoutes = router;
