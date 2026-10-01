import { z } from "zod";

export const StatsValidation = {
  // Empty validation object as stats currently only takes GET without body
  emptySchema: z.object({}),
};
