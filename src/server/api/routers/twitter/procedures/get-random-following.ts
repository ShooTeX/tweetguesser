import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure } from "../../../trpc";

const getRandomFollowingInputSchema = z.object({
  username: z.string().min(1),
});

export const getRandomFollowing = publicProcedure
  .input(getRandomFollowingInputSchema)
  .query(async ({ ctx, input: { username } }) => {
    const user = await ctx.twitter.users.findUserByUsername(username);

    if (user.errors?.length) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: user.errors.at(0)?.title,
      });
    }

    if (!user.data?.id) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "User id was not returned",
      });
    }

    const following = await ctx.twitter.users.usersIdFollowing(user.data.id, {
      max_results: 1000,
    });

    if (following.errors?.length) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: following.errors.at(0)?.title,
      });
    }

    if (!following.data) {
      return [];
    }

    return following.data.map((item) => item.username.toLowerCase());
  });
