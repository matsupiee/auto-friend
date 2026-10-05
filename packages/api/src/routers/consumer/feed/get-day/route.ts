import { agentEventTypes } from "@auto-friend/db/constants/agent-parameters";
import z from "zod";

import { protectedProcedure } from "../../../../index";
import { handler } from "./handler";

export const feedGetDayInputSchema = z.object({ day: z.number().int().optional() });

const feedGetDayOutputSchema = z.object({
  day: z.number(),
  currentDay: z.number(),
  firstDay: z.number(),
  events: z.array(
    z.object({
      id: z.string(),
      minuteOfDay: z.number(),
      type: z.enum(agentEventTypes),
      text: z.string(),
      importance: z.number(),
      counterpart: z.object({ id: z.string(), displayName: z.string() }).nullable(),
    }),
  ),
  stats: z.object({ likes: z.number(), newAcquaintances: z.number(), conversations: z.number() }),
  diary: z.array(z.string()),
});

// 自分のエージェントに、その日に起きたこと。day を省略すると今日。
// エラー: PRECONDITION_FAILED（エージェント未作成）
export const feedGetDayRoute = protectedProcedure
  .input(feedGetDayInputSchema)
  .output(feedGetDayOutputSchema)
  .query(handler);
