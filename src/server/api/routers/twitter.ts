import { z } from "zod";
import { env } from "../../../env/server.mjs";
import { tweetDataSchema } from "../../../schemas/tweet-data";
import { createTRPCRouter, publicProcedure } from "../trpc";

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
] as const;

export const twitterRouter = createTRPCRouter({
  getNextRound: publicProcedure.query(async ({ ctx }) => {
    const randomUser =
      twitterUserList[Math.floor(Math.random() * twitterUserList.length)];

    if (!randomUser) {
      throw "Something went really wrong";
    }

    const { data: user } = await ctx.twitter.users.findUserById(randomUser.id, {
      "user.fields": ["profile_image_url"],
    });

    if (!user) {
      throw "Something went really wrong";
    }

    const { data: tweets } = await ctx.twitter.tweets.usersIdTweets(user.id, {
      exclude: ["replies", "retweets"],
    });

    const randomTweet =
      tweets?.[Math.floor(Math.random() * twitterUserList.length)];

    if (!randomTweet) {
      throw "Something went really wrong";
    }

    return {
      id: randomTweet.id,
      text: randomTweet.text,
      user,
      possibleNames: randomUser.possibleNames,
    };
  }),
});
