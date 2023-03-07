import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure } from "../../../trpc";

const getListMembersInputSchema = z.object({
  id: z.string(),
});

export const getListMembers = publicProcedure
  .input(getListMembersInputSchema)
  .query(async ({ ctx, input: { id } }) => {
    const list = await ctx.twitter.users.listGetMembers(id, {
      "user.fields": ["username"],
      max_results: 20,
    });
    if (list.errors?.length) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: list.errors.at(0)?.title,
      });
    }

    if (!list.data?.length) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "No users were returned",
      });
    }

    return list.data.map((user) => user.username.toLowerCase());
  });
