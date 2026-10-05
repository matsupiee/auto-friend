import { agent } from "@auto-friend/db/schema/agent";
import { worldClock } from "@auto-friend/db/schema/world-clock";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import type z from "zod";

import type { ProtectedContext } from "../../../../context";
import { computeAge } from "../../../../shared/agent/compute-age";
import { computeParametersFromAnswers } from "../../../../shared/agent/compute-parameters-from-answers";
import { createRng } from "../../../../shared/simulation/create-rng";
import { loadWorld } from "../../../../shared/simulation/load-world";
import { saveWorldChanges } from "../../../../shared/simulation/save-world-changes";
import { welcomeNewcomer } from "../../../../shared/simulation/welcome-newcomer";
import type { agentCreateInputSchema } from "./route";

const MIN_AGE = 18;

function currentMinuteInJapan(now: Date): number {
  return ((now.getUTCHours() + 9) % 24) * 60 + now.getUTCMinutes();
}

export async function handler({
  ctx,
  input,
}: {
  ctx: ProtectedContext;
  input: z.infer<typeof agentCreateInputSchema>;
}) {
  const userId = ctx.session.user.id;
  if (computeAge(input.birthDate) < MIN_AGE) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "18歳以上の方のみ利用できます" });
  }
  const parameters = computeParametersFromAnswers(input.answers);
  if (!parameters) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "すべての質問に回答してください" });
  }

  return ctx.db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: agent.id })
      .from(agent)
      .where(eq(agent.userId, userId))
      .limit(1);
    if (existing) {
      throw new TRPCError({ code: "CONFLICT", message: "エージェントはすでに作成済みです" });
    }

    let [clock] = await tx.select().from(worldClock).limit(1);
    if (!clock) [clock] = await tx.insert(worldClock).values({ currentDay: 1 }).returning();
    const currentDay = clock?.currentDay ?? 1;

    const rng = createRng(Date.now());
    const [created] = await tx
      .insert(agent)
      .values({
        userId,
        isSakura: false,
        displayName: input.displayName,
        gender: input.gender,
        romanticPreference: input.romanticPreference,
        birthDate: input.birthDate,
        birthplace: input.birthplace,
        schoolType: input.schoolType,
        club: input.club,
        circle: input.circle,
        hobbies: input.hobbies,
        ...parameters,
        appearance: 0.55 + rng.next() * 0.25,
        joinedDay: currentDay,
      })
      .returning();
    if (!created) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    // 参加した直後から、いいねと出会いが届くようにする
    const world = await loadWorld(tx);
    const newcomer = world.agents.find((a) => a.id === created.id);
    if (!newcomer) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const events = welcomeNewcomer({
      day: currentDay,
      newcomer,
      agents: world.agents,
      store: world.store,
      rng,
      fromMinute: Math.min(currentMinuteInJapan(new Date()), 21 * 60),
    });
    await saveWorldChanges(tx, world.store, events);

    return { agentId: created.id, welcomeEventCount: events.length };
  });
}
