import { z } from "zod";
import { publicProcedure } from "../../../trpc";

const getTweetInputsSchema = z.object({
  id: z.string(),
});

export const getTweet = publicProcedure
  .input(getTweetInputsSchema)
  .query(async ({ ctx, input }) => {
    return ctx.twitter.tweets.findTweetById(input.id, {
      expansions: ["attachments.media_keys", "author_id"],
      "user.fields": ["username", "name", "profile_image_url"],
      "media.fields": ["url", "width", "height", "alt_text"],
      "tweet.fields": ["entities"],
    });
  });
