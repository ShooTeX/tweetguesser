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
  {
    id: "2233154425",
    possibleNames: ["stephen king"],
  },
  {
    id: "44196397",
    possibleNames: ["mr. tweet"],
  },
];

export const twitterRouter = createTRPCRouter({
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
