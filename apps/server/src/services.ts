import { createAuth } from "@auto-friend/auth";
import { createDb } from "@auto-friend/db";

import { ENV } from "./env.server";

export const db = createDb(ENV);
export const auth = createAuth(ENV, db);
