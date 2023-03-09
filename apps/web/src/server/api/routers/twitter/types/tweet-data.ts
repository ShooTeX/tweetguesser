import type { components } from "twitter-api-sdk/dist/types";

export type TweetData = {
  id: string;
  text: string;
  profile_image_url?: string;
  name: string;
  username: string;
  images: components["schemas"]["Photo"][];
  entities?: components["schemas"]["FullTextEntities"];
  referenced_tweet_id?: string;
};
