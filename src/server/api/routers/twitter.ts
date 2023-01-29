import { createTRPCRouter, publicProcedure } from "../trpc";

export const twitterRouter = createTRPCRouter({
  test: publicProcedure.query(({ ctx }) => {
    return ctx.twitter.singleTweet('1557717236391071756');
  }),
})
