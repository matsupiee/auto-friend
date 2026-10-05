import z from "zod";

import { protectedProcedure } from "../../../../index";
import { handler } from "./handler";

const agentGetMineOutputSchema = z
  .object({
    id: z.string(),
    displayName: z.string(),
    gender: z.enum(["male", "female", "other"]),
    joinedDay: z.number(),
    currentDay: z.number(),
    todayLikeCount: z.number(),
    totalLikeCount: z.number(),
    partner: z
      .object({ id: z.string(), displayName: z.string(), state: z.enum(["dating", "partner"]) })
      .nullable(),
  })
  .nullable();

// エージェントをまだ作っていなければ null を返す
export const agentGetMineRoute = protectedProcedure.output(agentGetMineOutputSchema).query(handler);
