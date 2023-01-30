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
  getNextRound: publicProcedure.query(async () => {
    const randomUser =
      twitterUserList[Math.floor(Math.random() * twitterUserList.length)];

    if (!randomUser) {
      throw "Something went really wrong";
    }

    const tweetsResult = await fetch(
      `https://api.twitter.com/2/users/${randomUser.id}/tweets?exclude=retweets,replies`,
      { headers: { authorization: `Bearer ${env.TWITTER_TOKEN}` } }
    );

    const parsedTweets = z
      .object({ data: z.array(tweetDataSchema) })
      .parse(await tweetsResult.json()).data;

    const randomTweet =
      parsedTweets[Math.floor(Math.random() * twitterUserList.length)];

    if (!randomTweet) {
      throw "Something went really wrong";
    }

    return { text: randomTweet.text, user: randomUser };
  }),
});
