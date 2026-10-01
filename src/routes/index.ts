import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { CategoryRoutes } from "../modules/category/category.routes";
import { CommentRoutes } from "../modules/comment/comment.routes";
import { IdeaRoutes } from "../modules/idea/idea.routes";
import { NewsletterRoutes } from "../modules/newsletter/newsletter.routes";
import { PaymentRoutes } from "../modules/payment/payment.routes";
import { StatsRoutes } from "../modules/stats/stats.routes";
import { UserRoutes } from "../modules/user/user.routes";
import { VoteRoutes } from "../modules/vote/vote.routes";
import { WatchlistRoutes } from "../modules/watchlist/watchlist.routes";
import { UploadRoutes } from "../modules/upload/upload.routes";
import { AdminRoutes } from "../modules/admin/admin.routes";
import { AiRoutes } from "../modules/ai/ai.routes";

const router = Router();

const moduleRoutes = [
  { path: "/auth", route: AuthRoutes },
  { path: "/users", route: UserRoutes },
  { path: "/categories", route: CategoryRoutes },
  { path: "/ideas", route: IdeaRoutes },
  { path: "/admin", route: AdminRoutes },
  { path: "/votes", route: VoteRoutes },
  { path: "/comments", route: CommentRoutes },
  { path: "/payments", route: PaymentRoutes },
  { path: "/newsletter", route: NewsletterRoutes },
  { path: "/watchlist", route: WatchlistRoutes },
  { path: "/stats", route: StatsRoutes },
  { path: "/upload", route: UploadRoutes },
  { path: "/ai", route: AiRoutes },
];

moduleRoutes.forEach((item) => router.use(item.path, item.route));

export const AppRouter = router;
