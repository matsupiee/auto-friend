import { canBeRomantic } from "../agent/can-be-romantic";
import type { InteractionAction, SimAgent, WorldContext } from "./simulation-types";

const ROMANTIC_ACTIONS: InteractionAction[] = ["invite_date", "hint_affection", "flirt"];
const MAX_DAILY_INTERACTIONS = 8;

// Rule Engine（要件定義 10.4）。Jev の選択が世界のルール上実行できるかを判定する。
// 実行できない場合は、実行できる行動に置き換えるか null を返す。
export function validateAction(
  world: WorldContext,
  agent: SimAgent,
  target: SimAgent,
  action: InteractionAction,
): InteractionAction | null {
  const { store, day } = world;
  if ((world.dailyInteractions.get(target.id) ?? 0) >= MAX_DAILY_INTERACTIONS) return null;

  const relationship = store.get(agent.id, target.id);
  if (relationship?.cooldownUntilDay != null && relationship.cooldownUntilDay >= day) return null;

  if (!ROMANTIC_ACTIONS.includes(action)) return action;
  if (!canBeRomantic(agent, target)) return "chat";

  const myPartner = store.partnerOf(agent.id);
  const theirPartner = store.partnerOf(target.id);
  if (myPartner === target.id) return action;

  // 恋人がいるのに別の相手へ好意を示すと「フラート」になる。恋人関係は新しく作らない
  if (myPartner) {
    return agent.romance.loyalty < 0.5 && agent.romance.flirtiness > 0.4 ? "flirt" : "chat";
  }
  // 相手に恋人がいる場合、デートには誘えない
  if (theirPartner && action === "invite_date") return "hint_affection";
  return action;
}
