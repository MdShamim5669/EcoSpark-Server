import { z } from "zod";

export const addToWatchlistSchema = z.object({
  body: z.object({
    ideaId: z.string().uuid("Invalid idea ID"),
  }),
});

export const WatchlistValidation = {
  addToWatchlistSchema,
};
