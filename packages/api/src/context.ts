import type { Session } from "@auto-friend/auth";
import type { Database } from "@auto-friend/db";

export type Context = {
  session: Session | null;
  db: Database;
};

export type ProtectedContext = Context & { session: Session };
