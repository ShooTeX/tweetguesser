import { TRPCError } from "@trpc/server";
import { uniq } from "remeda";
import { z } from "zod";
import { publicProcedure } from "../../../trpc";
import type { TweetData } from "../types/tweet-data";

const getTweetsInputSchema = z.object({
  ids: z.array(z.string()).min(2),
});

export const getTweets = publicProcedure
  .input(getTweetsInputSchema)
  .query(async ({ ctx, input: { ids } }) => {
    const tweets = await ctx.twitter.tweets.findTweetsById({
      ids,
      expansions: ["attachments.media_keys", "author_id"],
      "media.fields": ["url", "width", "height", "alt_text"],
      "tweet.fields": ["entities", "referenced_tweets", "author_id"],
      "user.fields": ["name", "username", "profile_image_url"],
    });

    console.log(tweets);

    if (tweets.errors) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: tweets.errors.at(0)?.title,
      });
    }

    if (!tweets?.data) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "No tweets were found",
      });
    }

    const tweetData: TweetData[] = [];
    for (const tweet of tweets.data) {
      if (
        tweet.attachments?.media_keys
          ?.flatMap((mediaKey) =>
            tweets.includes?.media?.find(
              (media) => media.media_key === mediaKey && media.type !== "photo"
            )
          )
          .filter(Boolean).length
      ) {
        continue;
      }

      const user = tweets.includes?.users?.find(
        (user) => user.id === tweet.author_id
      );

      const images =
        tweet.attachments?.media_keys
          ?.flatMap((mediaKey) =>
            tweets.includes?.media?.filter(
              (mediaExpanded) =>
                mediaExpanded.media_key === mediaKey &&
                mediaExpanded.type === "photo"
            )
          )
          .filter(Boolean) || [];

      const referenced_tweet_id = tweet.referenced_tweets?.[0]?.id;

      tweetData.push({
        id: tweet.id,
        text: tweet.text,
        name: user?.name || "Error :(",
        username: user?.username || "Error :(",
        profile_image_url: user?.profile_image_url || "Error :(",
        images,
        entities: tweet.entities,
        referenced_tweet_id,
      });
    }
    const usernames = uniq(tweetData.map((tweet) => tweet.username));
    return {
      tweets: tweetData,
      usernames,
    };
  });
