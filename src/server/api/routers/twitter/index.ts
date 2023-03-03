import { createTRPCRouter } from "../../trpc";
import { getListMembers } from "./procedures/get-list-members";
import { getRandomFollowing } from "./procedures/get-random-following";
import { getTweet } from "./procedures/get-tweet";
import { getTweets } from "./procedures/get-tweets";

export const twitterRouter = createTRPCRouter({
  getListMembers,
  getRandomFollowing,
  getTweets,
  getTweet,
});
