import { VoteType } from "@prisma/client";
import { z } from "zod";

export const castVoteSchema = z.object({
  body: z.object({
    type: z.nativeEnum(VoteType, { required_error: "Vote type must be UP or DOWN" }),
  }),
});

export const VoteValidation = {
  castVoteSchema,
};
