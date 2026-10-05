import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { agentEventTypes } from "../constants/agent-parameters";
import { agent } from "./agent";

export type AgentEventPayload = {
  thirdAgentId?: string;
  hobby?: string;
  streakDays?: number;
};

// エージェントに起きた出来事。actor が target に対して何かをした、という形で持つ。
export const agentEvent = sqliteTable(
  "agent_event",
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
    day: integer("day").notNull(),
    minuteOfDay: integer("minute_of_day").notNull(),
    type: text("type", { enum: agentEventTypes }).notNull(),
    actorAgentId: text("actor_agent_id")
      .notNull()
      .references(() => agent.id, { onDelete: "cascade" }),
    targetAgentId: text("target_agent_id").references(() => agent.id, { onDelete: "cascade" }),
    // 0: 通常 1: 注目 2: 重要（通知対象）
    importance: integer("importance").notNull().default(0),
    payload: text("payload", { mode: "json" }).$type<AgentEventPayload>().notNull().default({}),
  },
  (table) => [
    index("agent_event_actor_day_idx").on(table.actorAgentId, table.day),
    index("agent_event_target_day_idx").on(table.targetAgentId, table.day),
    index("agent_event_day_importance_idx").on(table.day, table.importance),
  ],
);
