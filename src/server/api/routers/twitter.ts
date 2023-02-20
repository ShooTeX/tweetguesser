import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import type { components } from "twitter-api-sdk/dist/types";
import { formatISO } from "date-fns";

const getTweetsInputSchema = z.object({
  usernames: z.array(z.string().min(1)).min(1).max(20),
  endTime: z.coerce.date().optional(),
});

const getTweetInputsSchema = z.object({
  id: z.string(),
});

type GetTweetsResponse = {
  id: string;
  text: string;
  profile_image_url?: string;
  name: string;
  username: string;
  images: components["schemas"]["Photo"][];
  entities?: components["schemas"]["FullTextEntities"];
  referenced_tweet_id?: string;
}[];

export const twitterRouter = createTRPCRouter({
  getTweets: publicProcedure
    .input(getTweetsInputSchema)
    .query(async ({ ctx, input: { usernames, endTime } }) => {
      const { data: users, errors } =
        await ctx.twitter.users.findUsersByUsername({
          usernames,
          "user.fields": ["profile_image_url"],
        });

      if (errors) {
        const invalidUsernames = errors
          .map(({ detail }) =>
            detail?.slice(detail.indexOf("[") + 1, detail.indexOf("]"))
          )
          .filter(Boolean) as string[];

        if (invalidUsernames.length === 0) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: errors.at(0)?.detail,
          });
        }

        return { invalidUsernames, tweets: [] };
      }

      if (!users) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "No users were returned",
        });
      }

      const response: GetTweetsResponse = [];
      for (const user of users) {
        const tweets = await ctx.twitter.tweets.usersIdTweets(user.id, {
          expansions: ["attachments.media_keys"],
          "media.fields": ["url", "width", "height", "alt_text"],
          exclude: ["replies", "retweets"],
          end_time: endTime ? formatISO(endTime) : undefined,
          max_results: 20,
          "tweet.fields": ["entities", "referenced_tweets"],
        });

        if (tweets.errors) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: tweets.errors.at(0)?.title,
          });
        }

        if (!tweets.data) {
          continue;
        }

        for (const tweet of tweets.data) {
          if (
            tweet.attachments?.media_keys
              ?.flatMap((mediaKey) =>
                tweets.includes?.media?.find(
                  (media) =>
                    media.media_key === mediaKey && media.type !== "photo"
                )
              )
              .filter(Boolean).length
          ) {
            continue;
          }

          const images =
            tweet.attachments?.media_keys
              ?.flatMap((mediaKey) =>
                tweets.includes?.media?.filter(
                  (mediaExpanded) =>
                    mediaExpanded.media_key === mediaKey &&
                    mediaExpanded.type === "photo"
                )
              )
              .filter(
                (image): image is GetTweetsResponse[0]["images"][0] => !!image
              ) || [];

          const referenced_tweet_id = tweet.referenced_tweets?.[0]?.id;

          response.push({
            id: tweet.id,
            text: tweet.text,
            name: user.name,
            username: user.username,
            profile_image_url: user.profile_image_url,
            images,
            entities: tweet.entities,
            referenced_tweet_id,
          });
        }
      }
      return { tweets: response };
    }),
  getTweet: publicProcedure
    .input(getTweetInputsSchema)
    .query(async ({ ctx, input }) => {
      return ctx.twitter.tweets.findTweetById(input.id, {
        expansions: ["attachments.media_keys", "author_id"],
        "user.fields": ["username", "name", "profile_image_url"],
        "media.fields": ["url", "width", "height", "alt_text"],
        "tweet.fields": ["entities"],
      });
    }),
});
