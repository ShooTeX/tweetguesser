import { createTRPCRouter } from "../../trpc";
import { getListMembers } from "./procedures/get-list-members";
import { getRandomFollowing } from "./procedures/get-random-following";
import { getTweet } from "./procedures/get-tweet";
import { getTweets } from "./procedures/get-tweets";
import { getTweetsByUsernames } from "./procedures/get-tweets-by-username";

export const twitterRouter = createTRPCRouter({
  getListMembers,
  getRandomFollowing,
  getTweetsByUsernames,
  getTweets,
  getTweet,
});
