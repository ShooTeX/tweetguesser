import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import arrayShuffle from "array-shuffle";
import { TRPCError } from "@trpc/server";
import type { components } from "twitter-api-sdk/dist/types";

const getTweetsInputSchema = z.array(z.string().min(1)).min(1).max(20);

type GetTweetsResponse = {
  id: string;
  text: string;
  profile_image_url?: string;
  name: string;
  username: string;
  images: components["schemas"]["Photo"][];
  entities?: components["schemas"]["FullTextEntities"];
}[];

export const twitterRouter = createTRPCRouter({
  getTweets: publicProcedure
    .input(getTweetsInputSchema)
    .query(async ({ ctx, input }) => {
      const { data: users, errors } =
        await ctx.twitter.users.findUsersByUsername({
          usernames: input,
          "user.fields": ["profile_image_url"],
        });

      if (errors) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: errors.at(0)?.title,
        });
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
          max_results: 20,
          "tweet.fields": ["entities"],
        });

        if (tweets.errors) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: tweets.errors.at(0)?.title,
          });
        }

        if (!tweets.data) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "No tweets were returned",
          });
        }

        tweets.data.forEach((tweet) => {
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
            return;
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

          response.push({
            id: tweet.id,
            text: tweet.text,
            name: user.name,
            username: user.username,
            profile_image_url: user.profile_image_url,
            images,
            entities: tweet.entities,
          });
        });
      }
      return arrayShuffle(response);
    }),
});
