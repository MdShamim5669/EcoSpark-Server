import { Router } from "express";
import { USER_ROLE } from "../../constants";
import { auth } from "../../middlewares/auth";
import { role } from "../../middlewares/role";
import { validateRequest } from "../../middlewares/validateRequest";
import { NewsletterController } from "./newsletter.controller";
import { NewsletterValidation } from "./newsletter.validation";

const router = Router();

// Public: subscribe
router.post(
  "/subscribe",
  validateRequest(NewsletterValidation.subscribeNewsletterSchema),
  NewsletterController.subscribe
);

// Admin: view all subscribers
router.get("/", auth, role(USER_ROLE.ADMIN), NewsletterController.getAllSubscribers);

export const NewsletterRoutes = router;
