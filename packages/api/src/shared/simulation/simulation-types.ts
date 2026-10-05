import type {
  AgentEventType,
  Gender,
  Personality,
  Preference,
  RelationshipStateName,
  Romance,
} from "@auto-friend/db/constants/agent-parameters";
import type { AgentEventPayload } from "@auto-friend/db/schema/agent-event";

// シミュレーションはDBから切り離したメモリ上の値で行う。ここではその型だけを定義する。

export type SimAgent = {
  id: string;
  isSakura: boolean;
  displayName: string;
  gender: Gender;
  romanticPreference: Gender[];
  birthplace: string;
  schoolType: string;
  club: string;
  circle: string;
  hobbies: string[];
  personality: Personality;
  romance: Romance;
  preference: Preference;
  appearance: number;
  joinedDay: number;
};

export type SimRelationship = {
  id?: string;
  sourceAgentId: string;
  targetAgentId: string;
  attraction: number;
  trust: number;
  familiarity: number;
  chemistry: number;
  attachment: number;
  conflict: number;
  jealousy: number;
  state: RelationshipStateName;
  stateChangedDay: number;
  lastInteractionDay: number | null;
  interactionStreak: number;
  likedDay: number | null;
  cooldownUntilDay: number | null;
};

export type SimEvent = {
  day: number;
  minuteOfDay: number;
  type: AgentEventType;
  actorAgentId: string;
  targetAgentId: string | null;
  importance: number;
  payload: AgentEventPayload;
};

export type InteractionAction =
  | "first_meet"
  | "chat"
  | "hobby_talk"
  | "consult"
  | "invite_date"
  | "hint_affection"
  | "flirt"
  | "keep_distance"
  | "make_up";

export type InteractionOutcome = "great" | "good" | "awkward";

export type WorldContext = {
  day: number;
  agents: Map<string, SimAgent>;
  store: import("./create-relationship-store").RelationshipStore;
  rng: import("./create-rng").Rng;
  events: SimEvent[];
  // その日に交流した回数。人気のエージェントに交流が集中しすぎないようにする。
  dailyInteractions: Map<string, number>;
};

export type Candidate = {
  agentId: string;
  kind: "partner" | "crush" | "interested" | "friend" | "acquaintance" | "admirer" | "new";
};
