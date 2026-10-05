import z from "zod";

import { protectedProcedure } from "../../../../index";
import { handler } from "./handler";

const worldGetStatusOutputSchema = z.object({
  currentDay: z.number(),
  population: z.number(),
  coupleCount: z.number(),
  headlines: z.array(
    z.object({ id: z.string(), day: z.number(), minuteOfDay: z.number(), text: z.string() }),
  ),
});

export const worldGetStatusRoute = protectedProcedure
  .output(worldGetStatusOutputSchema)
  .query(handler);
