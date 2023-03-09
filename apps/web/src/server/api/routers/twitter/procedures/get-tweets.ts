import { z } from "zod";
import { publicProcedure } from "../../../trpc";

const getTweetsInputSchema = z.object({
  ids: z.array(z.string()).min(2),
});

export const getTweets = publicProcedure
  .input(getTweetsInputSchema)
  .query(async ({ ctx, input: { ids } }) => {
    const tweets = await ctx.twitter.tweets.findTweetsById({ ids });
    return tweets;
  });
