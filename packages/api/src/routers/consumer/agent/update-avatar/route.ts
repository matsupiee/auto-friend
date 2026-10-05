import { avatarSchema } from "@auto-friend/avatar/avatar-schema";
import z from "zod";

import { protectedProcedure } from "../../../../index";
import { handler } from "./handler";

export const agentUpdateAvatarInputSchema = z.object({ avatar: avatarSchema });

const agentUpdateAvatarOutputSchema = z.object({ avatar: avatarSchema });

// 自分のエージェントの見た目を作り直す。見た目は何度でも変えられ、関係や出来事には影響しない。
// エラー: PRECONDITION_FAILED（エージェント未作成）
export const agentUpdateAvatarRoute = protectedProcedure
  .input(agentUpdateAvatarInputSchema)
  .output(agentUpdateAvatarOutputSchema)
  .mutation(handler);
