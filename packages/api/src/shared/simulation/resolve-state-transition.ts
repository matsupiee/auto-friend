import { canBeRomantic } from "../agent/can-be-romantic";
import type { SimRelationship, WorldContext } from "./simulation-types";

const ACTIVE_CRUSH_SOFT_LIMIT = 3;

// State Machine（要件定義 7）。数値の変化を受けて、自動で起きる状態遷移だけを行う。
// 交際・恋人・元恋人への遷移は告白や別れの判断を経るため、ここでは扱わない。
export function resolveStateTransition(
  world: WorldContext,
  relationship: SimRelationship,
  minuteOfDay: number,
): void {
  const { store, day, events } = world;
  const source = world.agents.get(relationship.sourceAgentId);
  const target = world.agents.get(relationship.targetAgentId);
  if (!source || !target) return;
  const romantic = canBeRomantic(source, target);
  const emit = (type: (typeof events)[number]["type"], importance: number) =>
    events.push({
      day,
      minuteOfDay,
      type,
      actorAgentId: source.id,
      targetAgentId: target.id,
      importance,
      payload: {},
    });

  switch (relationship.state) {
    case "stranger":
      if (relationship.familiarity > 0) store.setState(relationship, "acquaintance", day);
      return;
    case "acquaintance":
      // 一目惚れ。友達になる前に気になり始めることもある
      if (romantic && relationship.attraction >= 50 && relationship.familiarity >= 12) {
        store.setState(relationship, "interested", day);
        emit("became_interested", 1);
        return;
      }
      if (relationship.familiarity >= 18 && relationship.trust >= 10) {
        store.setState(relationship, "friend", day);
        const reverse = store.get(target.id, source.id);
        if (reverse && ["friend", "interested", "crush"].includes(reverse.state)) {
          emit("became_friends", 1);
        }
      }
      return;
    case "friend":
      if (romantic && relationship.attraction >= 45) {
        store.setState(relationship, "interested", day);
        emit("became_interested", 1);
      }
      return;
    case "interested":
      if (relationship.attraction < 35) {
        store.setState(relationship, "friend", day);
      } else if (relationship.attraction >= 62 && relationship.attachment >= 12) {
        // 片思いが多すぎるときは、いちばん気持ちの弱い相手を「気になる」に戻す
        const crushes = store
          .outgoing(source.id)
          .filter((r) => r.state === "crush")
          .sort((a, b) => a.attraction - b.attraction);
        const weakest = crushes[0];
        if (crushes.length >= ACTIVE_CRUSH_SOFT_LIMIT && weakest) {
          if (weakest.attraction >= relationship.attraction) return;
          // 気持ちが新しい相手に移った分、前の相手への気持ちは少し冷める
          weakest.attraction = Math.min(weakest.attraction, 55);
          store.setState(weakest, "interested", day);
        }
        store.setState(relationship, "crush", day);
        emit("fell_for", 2);
      }
      return;
    case "crush":
      if (relationship.attraction < 45) store.setState(relationship, "interested", day);
      return;
    default:
      return;
  }
}
