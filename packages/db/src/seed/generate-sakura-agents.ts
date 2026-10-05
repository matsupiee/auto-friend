import { generateAvatarFromSeed } from "@auto-friend/avatar/generate-avatar-from-seed";

import type { Gender } from "../constants/agent-parameters";
import { personalityKeys, preferenceKeys, romanceKeys } from "../constants/agent-parameters";
import { circles, clubs, hobbies, prefectures, schoolTypes } from "../constants/profile-options";
import type { agent } from "../schema/agent";
import type { SeedRng } from "./create-seed-rng";
import { femaleNames, maleNames, neutralNames } from "./sakura-names";

type AgentInsert = typeof agent.$inferInsert;

function pickGender(rng: SeedRng): Gender {
  const roll = rng.next();
  if (roll < 0.47) return "female";
  if (roll < 0.94) return "male";
  return "other";
}

function pickRomanticPreference(rng: SeedRng, gender: Gender): Gender[] {
  const roll = rng.next();
  if (gender === "other")
    return rng.chance(0.5) ? ["male", "female", "other"] : [rng.pick(["male", "female"] as const)];
  const opposite: Gender = gender === "male" ? "female" : "male";
  if (roll < 0.88) return [opposite];
  if (roll < 0.94) return [gender];
  return ["male", "female", "other"];
}

function pickName(rng: SeedRng, gender: Gender, used: Set<string>): string {
  const pool = gender === "female" ? femaleNames : gender === "male" ? maleNames : neutralNames;
  for (let attempt = 0; attempt < 20; attempt++) {
    const [kata, hira, roma] = rng.pick(pool);
    const style = rng.next();
    let name: string;
    if (style < 0.45) name = kata;
    else if (style < 0.7) name = hira;
    else if (style < 0.85) name = roma.charAt(0).toUpperCase() + roma.slice(1);
    else name = `${roma}_${String(rng.int(1, 99)).padStart(2, "0")}`;
    if (!used.has(name)) {
      used.add(name);
      return name;
    }
  }
  const [kata] = rng.pick(pool);
  const fallback = `${kata}${used.size}`;
  used.add(fallback);
  return fallback;
}

function birthDateFor(rng: SeedRng, today: Date): string {
  // 20代前半を中心に 18〜34 歳
  const age = Math.round(
    Math.max(18, Math.min(34, 23 + ((rng.next() + rng.next() + rng.next() - 1.5) / 1.5) * 8)),
  );
  const year = today.getFullYear() - age - 1;
  const month = rng.int(1, 12);
  const dayOfMonth = rng.int(1, 28);
  return `${year}-${String(month).padStart(2, "0")}-${String(dayOfMonth).padStart(2, "0")}`;
}

// サクラエージェントを count 体ぶん作る。人間のユーザーと区別がつかないよう、同じ項目を同じ選択肢から埋める。
export function generateSakuraAgents(rng: SeedRng, count: number, today: Date): AgentInsert[] {
  const used = new Set<string>();
  const agents: AgentInsert[] = [];
  for (let i = 0; i < count; i++) {
    const gender = pickGender(rng);
    const preference = Object.fromEntries(
      preferenceKeys.map((key) => [key, rng.param(0.4, 0.2)]),
    ) as Record<(typeof preferenceKeys)[number], number>;
    for (const key of rng.sample(preferenceKeys, 2))
      preference[key] = Math.min(0.95, preference[key] + 0.35);

    const displayName = pickName(rng, gender, used);
    agents.push({
      userId: null,
      isSakura: true,
      displayName,
      gender,
      // 見た目は世界の乱数とは別に決める。見た目を変えても、関係や出来事の生成結果は変わらない
      avatar: generateAvatarFromSeed(`sakura-${i}-${displayName}`, gender),
      romanticPreference: pickRomanticPreference(rng, gender),
      birthDate: birthDateFor(rng, today),
      // 人口の多い地域ほど出やすくする
      birthplace: rng.chance(0.45)
        ? rng.pick([
            "東京都",
            "神奈川県",
            "大阪府",
            "愛知県",
            "埼玉県",
            "千葉県",
            "福岡県",
          ] as const)
        : rng.pick(prefectures),
      schoolType: rng.chance(0.6)
        ? rng.pick(["共学の公立高校", "共学の私立高校"] as const)
        : rng.pick(schoolTypes),
      club: rng.pick(clubs),
      circle: rng.pick(circles),
      hobbies: rng.sample(hobbies, rng.int(3, 7)),
      personality: Object.fromEntries(
        personalityKeys.map((key) => [key, rng.param()]),
      ) as AgentInsert["personality"],
      romance: Object.fromEntries(
        romanceKeys.map((key) => [key, rng.param()]),
      ) as AgentInsert["romance"],
      preference,
      appearance: rng.param(0.5, 0.18),
      joinedDay: 0,
    });
  }
  return agents;
}
