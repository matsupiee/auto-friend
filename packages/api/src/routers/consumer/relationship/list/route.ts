import { relationshipStates } from "@auto-friend/db/constants/agent-parameters";
import { avatarSchema } from "@auto-friend/avatar/avatar-schema";
import z from "zod";

import { protectedProcedure } from "../../../../index";
import { handler } from "./handler";

const relationshipItemSchema = z.object({
  agent: z.object({
    id: z.string(),
    displayName: z.string(),
    gender: z.enum(["male", "female", "other"]),
    avatar: avatarSchema,
  }),
  state: z.enum(relationshipStates),
  attraction: z.number(),
  trust: z.number(),
  familiarity: z.number(),
  likedMe: z.boolean(),
  interactionStreak: z.number(),
  lastInteractionDay: z.number().nullable(),
});

const relationshipListOutputSchema = z.object({
  groups: z.array(
    z.object({
      key: z.enum(["partner", "crush", "interested", "friend", "acquaintance", "ex"]),
      items: z.array(relationshipItemSchema),
    }),
  ),
  // まだ会っていないが、いいねをくれた相手
  admirers: z.array(
    z.object({
      id: z.string(),
      displayName: z.string(),
      gender: z.enum(["male", "female", "other"]),
      avatar: avatarSchema,
    }),
  ),
});

// エラー: PRECONDITION_FAILED（エージェント未作成）
export const relationshipListRoute = protectedProcedure
  .output(relationshipListOutputSchema)
  .query(handler);
