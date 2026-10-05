import { genders } from "@auto-friend/db/constants/agent-parameters";
import {
  circles,
  clubs,
  hobbies,
  prefectures,
  schoolTypes,
} from "@auto-friend/db/constants/profile-options";
import z from "zod";

import { protectedProcedure } from "../../../../index";
import { handler } from "./handler";

export const agentCreateInputSchema = z.object({
  displayName: z.string().trim().min(1).max(12),
  gender: z.enum(genders),
  romanticPreference: z.array(z.enum(genders)).min(1),
  birthDate: z.iso.date(),
  birthplace: z.enum(prefectures),
  schoolType: z.enum(schoolTypes),
  club: z.enum(clubs),
  circle: z.enum(circles),
  hobbies: z
    .array(z.enum(hobbies))
    .min(3)
    .max(8)
    .refine((list) => new Set(list).size === list.length, "同じ趣味が重複しています"),
  answers: z.record(z.string(), z.string()),
});

const agentCreateOutputSchema = z.object({
  agentId: z.string(),
  welcomeEventCount: z.number(),
});

// エラー: CONFLICT（作成済み） / BAD_REQUEST（18歳未満・回答不足）
export const agentCreateRoute = protectedProcedure
  .input(agentCreateInputSchema)
  .output(agentCreateOutputSchema)
  .mutation(handler);
