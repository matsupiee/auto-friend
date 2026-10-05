import type { DbExecutor } from "@auto-friend/db";
import { worldClock } from "@auto-friend/db/schema/world-clock";

// 世界の現在日。時計がまだなければ 1 日目とみなす。
export async function getCurrentDay(db: DbExecutor): Promise<number> {
  const [clock] = await db.select().from(worldClock).limit(1);
  return clock?.currentDay ?? 1;
}
