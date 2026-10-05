import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

import type { Gender, Personality, Preference, Romance } from "../constants/agent-parameters";
import { genders } from "../constants/agent-parameters";
import { user } from "./auth";

// 世界に住むAIエージェント。userId が null のものは運営が用意したサクラエージェント。
export const agent = sqliteTable(
  "agent",
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
    userId: text("user_id")
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    isSakura: integer("is_sakura", { mode: "boolean" }).default(false).notNull(),
    displayName: text("display_name").notNull(),
    gender: text("gender", { enum: genders }).notNull(),
    romanticPreference: text("romantic_preference", { mode: "json" }).$type<Gender[]>().notNull(),
    birthDate: text("birth_date").notNull(),
    birthplace: text("birthplace").notNull(),
    schoolType: text("school_type").notNull(),
    club: text("club").notNull(),
    circle: text("circle").notNull(),
    hobbies: text("hobbies", { mode: "json" }).$type<string[]>().notNull(),
    personality: text("personality", { mode: "json" }).$type<Personality>().notNull(),
    romance: text("romance", { mode: "json" }).$type<Romance>().notNull(),
    preference: text("preference", { mode: "json" }).$type<Preference>().notNull(),
    // 見た目の魅力度。ユーザーには表示しない内部値。
    appearance: real("appearance").notNull(),
    joinedDay: integer("joined_day").notNull(),
  },
  (table) => [index("agent_is_sakura_idx").on(table.isSakura)],
);
