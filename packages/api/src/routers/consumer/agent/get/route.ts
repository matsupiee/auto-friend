import { relationshipStates } from "@auto-friend/db/constants/agent-parameters";
import { avatarSchema } from "@auto-friend/avatar/avatar-schema";
import z from "zod";

import { protectedProcedure } from "../../../../index";
import { handler } from "./handler";

export const agentGetInputSchema = z.object({ agentId: z.string() });

const parameterSchema = z.array(
  z.object({ key: z.string(), label: z.string(), value: z.number() }),
);

const agentGetOutputSchema = z.object({
  id: z.string(),
  isMine: z.boolean(),
  displayName: z.string(),
  gender: z.enum(["male", "female", "other"]),
  avatar: avatarSchema,
  age: z.number(),
  birthplace: z.string(),
  schoolType: z.string(),
  club: z.string(),
  circle: z.string(),
  hobbies: z.array(z.string()),
  personality: parameterSchema,
  // 恋愛傾向は自分のエージェントのときだけ返す
  romance: parameterSchema.nullable(),
  mood: z.object({ emoji: z.string(), label: z.string() }),
  partner: z.object({ id: z.string(), displayName: z.string(), avatar: avatarSchema }).nullable(),
  closeAgents: z.array(
    z.object({
      id: z.string(),
      displayName: z.string(),
      avatar: avatarSchema,
      state: z.enum(relationshipStates),
    }),
  ),
  recentInterests: z.array(z.string()),
  // 自分のエージェントから見た、この相手との関係（他人のときのみ）
  myRelation: z
    .object({ state: z.enum(relationshipStates), likedMe: z.boolean(), iLiked: z.boolean() })
    .nullable(),
  recentEvents: z.array(
    z.object({ id: z.string(), day: z.number(), minuteOfDay: z.number(), text: z.string() }),
  ),
});

// エラー: NOT_FOUND（存在しないエージェント） / PRECONDITION_FAILED（自分のエージェント未作成）
export const agentGetRoute = protectedProcedure
  .input(agentGetInputSchema)
  .output(agentGetOutputSchema)
  .query(handler);
