import z from "zod";

import { protectedProcedure } from "../../../../index";
import { handler } from "./handler";

const agentGetOnboardingOptionsOutputSchema = z.object({
  prefectures: z.array(z.string()),
  schoolTypes: z.array(z.string()),
  clubs: z.array(z.string()),
  circles: z.array(z.string()),
  hobbies: z.array(z.string()),
  genders: z.array(z.object({ value: z.enum(["male", "female", "other"]), label: z.string() })),
  questions: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      options: z.array(z.object({ id: z.string(), label: z.string() })),
    }),
  ),
});

export const agentGetOnboardingOptionsRoute = protectedProcedure
  .output(agentGetOnboardingOptionsOutputSchema)
  .query(handler);
