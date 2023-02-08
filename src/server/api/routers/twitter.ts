import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import arrayShuffle from "array-shuffle";
import { TRPCError } from "@trpc/server";

const twitterUserList = [
  {
    id: "2612436266",
    possibleNames: ["imShooTeX", "ShooTeX", "STX"],
  },
  {
    id: "489785019",
    possibleNames: ["rox", "roxcodes"],
  },
  {
    id: "1349149096909668363",
    possibleNames: ["potus", "president", "joe biden"],
  },
  {
    id: "2233154425",
    possibleNames: ["stephen king"],
  },
  {
    id: "44196397",
    possibleNames: ["mr. tweet"],
  },
  {
    id: "337337691",
    possibleNames: ["ludwig"],
  },
  {
    id: "1203880363",
    possibleNames: ["pewdiepie"],
  },
  {
    id: "2455740283",
    possibleNames: ["boiwithtoomuchmoney"],
  },
  {
    id: "291797158",
    possibleNames: ["nvimgod"],
  },
  {
    id: "786375418685165568",
    possibleNames: ["theo"],
  },
  {
    id: "62513246",
    possibleNames: ["jk rowling"],
  },
];

const getTweetsInputSchema = z.array(z.string().min(1)).min(1).max(20);

type GetTweetsResponse = {
  id: string;
  text: string;
  profile_image_url?: string;
  name: string;
  username: string;
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
          exclude: ["replies", "retweets"],
          max_results: 20,
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

        // TODO: add info about images, tweet url and user url
        tweets.data.forEach((tweet) => {
          response.push({
            id: tweet.id,
            text: tweet.text,
            name: user.name,
            username: user.username,
            profile_image_url: user.profile_image_url,
          });
        });
      }
      return arrayShuffle(response);
    }),
  getNextTweet: publicProcedure.query(async ({ ctx }) => {
    const randomUser =
      twitterUserList[Math.floor(Math.random() * twitterUserList.length)];

    if (!randomUser) {
      throw "missing random user";
    }

    const { data: user } = await ctx.twitter.users.findUserById(randomUser.id, {
      "user.fields": ["profile_image_url"],
    });

    if (!user) {
      throw "missing user";
    }

    const { data: tweets } = await ctx.twitter.tweets.usersIdTweets(user.id, {
      exclude: ["replies", "retweets"],
      max_results: 100,
    });

    const randomTweet =
      tweets?.[Math.floor(Math.random() * twitterUserList.length)];

    if (!randomTweet) {
      throw "missing tweets";
    }

    return {
      id: randomTweet.id,
      text: randomTweet.text,
      user,
      possibleNames: [...randomUser.possibleNames, user.name, user.username],
    };
  }),
});
