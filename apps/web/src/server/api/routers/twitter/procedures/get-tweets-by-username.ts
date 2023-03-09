import { TRPCError } from "@trpc/server";
import { formatISO } from "date-fns";
import { z } from "zod";
import { publicProcedure } from "../../../trpc";
import type { TweetData } from "../types/tweet-data";

type GetTweetsByUsernamesResponse = {
  tweets: TweetData[];
  invalidUsers?: InvalidUser[];
};

export type InvalidUser = {
  handle: string;
  reason: InvalidUserReason;
};

const invalidUserReasons = {
  forbidden: "forbidden",
  empty: "empty",
} as const;

type InvalidUserReason =
  (typeof invalidUserReasons)[keyof typeof invalidUserReasons];

const getTweetsByUsernamesInputSchema = z.object({
  usernames: z.array(z.string().min(1)).min(1).max(20),
  endTime: z.coerce.date().optional(),
});

// FIXME: this needs cleanup
export const getTweetsByUsernames = publicProcedure
  .input(getTweetsByUsernamesInputSchema)
  .query(
    async ({
      ctx,
      input: { usernames, endTime },
    }): Promise<GetTweetsByUsernamesResponse> => {
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
          .filter(Boolean)
          .flatMap(
            (username) =>
              ({
                handle: username,
                reason: invalidUserReasons.forbidden,
              } satisfies InvalidUser)
          );

        if (invalidUsernames.length === 0) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: errors.at(0)?.detail,
          });
        }

        return { invalidUsers: invalidUsernames, tweets: [] };
      }

      if (!users) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "No users were returned",
        });
      }

      const tweetData: TweetData[] = [];
      const invalidUsers: InvalidUser[] = [];
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
          invalidUsers.push({
            handle: user.username,
            reason: invalidUserReasons.empty,
          });
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
              .filter(Boolean) || [];

          const referenced_tweet_id = tweet.referenced_tweets?.[0]?.id;

          tweetData.push({
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
      return {
        tweets: tweetData,
        ...(invalidUsers.length > 0 ? { invalidUsers } : {}),
      };
    }
  );
