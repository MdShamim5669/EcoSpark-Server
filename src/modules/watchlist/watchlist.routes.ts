import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { WatchlistController } from "./watchlist.controller";
import { WatchlistValidation } from "./watchlist.validation";

const router = Router();

// Member watchlist routes
router.get("/my", auth, WatchlistController.getMyWatchlist);
router.post(
  "/",
  auth,
  validateRequest(WatchlistValidation.addToWatchlistSchema),
  WatchlistController.addToWatchlist
);
router.delete("/:ideaId", auth, WatchlistController.removeFromWatchlist);

export const WatchlistRoutes = router;
