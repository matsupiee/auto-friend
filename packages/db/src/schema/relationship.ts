import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { relationshipStates } from "../constants/agent-parameters";
import { agent } from "./agent";

// エージェントAからBへの感情。BからAへの感情は別の行で持つ。
export const relationship = sqliteTable(
  "relationship",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
    sourceAgentId: text("source_agent_id")
      .notNull()
      .references(() => agent.id, { onDelete: "cascade" }),
    targetAgentId: text("target_agent_id")
      .notNull()
      .references(() => agent.id, { onDelete: "cascade" }),
    attraction: real("attraction").notNull().default(0),
    trust: real("trust").notNull().default(0),
    familiarity: real("familiarity").notNull().default(0),
    chemistry: real("chemistry").notNull().default(0),
    attachment: real("attachment").notNull().default(0),
    conflict: real("conflict").notNull().default(0),
    jealousy: real("jealousy").notNull().default(0),
    state: text("state", { enum: relationshipStates }).notNull().default("stranger"),
    stateChangedDay: integer("state_changed_day").notNull(),
    lastInteractionDay: integer("last_interaction_day"),
    interactionStreak: integer("interaction_streak").notNull().default(0),
    likedDay: integer("liked_day"),
    cooldownUntilDay: integer("cooldown_until_day"),
  },
  (table) => [
    uniqueIndex("relationship_source_target_idx").on(table.sourceAgentId, table.targetAgentId),
    index("relationship_target_idx").on(table.targetAgentId),
    // 一夫一婦制。交際中・恋人の相手は1エージェントにつき1人まで。
    uniqueIndex("relationship_one_partner_idx")
      .on(table.sourceAgentId)
      .where(sql`state in ('dating', 'partner')`),
  ],
);
