import z from "zod";

import { protectedProcedure } from "../../../../index";
import { handler } from "./handler";

const worldAdvanceDayOutputSchema = z.object({
  day: z.number(),
  eventCount: z.number(),
  // 自分のエージェントに起きた重要な出来事（通知として表示する）
  notifications: z.array(z.string()),
});

// モック専用。本番では Scheduler が世界を進めるため、このAPIは置き換える。
export const worldAdvanceDayRoute = protectedProcedure
  .output(worldAdvanceDayOutputSchema)
  .mutation(handler);
