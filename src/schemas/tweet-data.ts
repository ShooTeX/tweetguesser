import { z } from "zod";

export const tweetDataSchema = z.object({
  id: z.string(),
  text: z.string(),
});

export type TweetData = z.infer<typeof tweetDataSchema>;
