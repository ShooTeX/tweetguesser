import { useAutoAnimate } from "@formkit/auto-animate/react";
import clsx from "clsx";
import { ImageOff } from "lucide-react";
import Image from "next/image";
import type { PropsWithChildren } from "react";
import { api, type RouterOutputs } from "../utils/api";
import { EntityHandler } from "./entity-handler";
import { ImageGrid } from "./image-grid";

export type TweetProperties = {
  avatar?: string;
  username: string;
  handle: string;
  children: string;
  hidden?: boolean;
  images: RouterOutputs["twitter"]["getTweets"]["tweets"][0]["images"];
  entities: RouterOutputs["twitter"]["getTweets"]["tweets"][0]["entities"];
  referencedTweet?: string;
  isQuoteTweet?: boolean;
};

type TweetWrapperProperties = PropsWithChildren & {
  isQuoteTweet?: boolean;
};

const TweetWrapper = ({ isQuoteTweet, children }: TweetWrapperProperties) => {
  const [animationParent] = useAutoAnimate();
  return (
    <div
      ref={animationParent}
      className={clsx([
        "bg-neutral text-neutral-content rounded-xl border p-4 shadow-xl",
        isQuoteTweet
          ? "w-full border-neutral-700 text-base"
          : "border-secondary w-[598px] text-2xl ",
      ])}
    >
      {children}
    </div>
  );
};

export const Tweet = ({
  avatar,
  username,
  handle,
  hidden = true,
  children,
  images,
  entities,
  isQuoteTweet,
  referencedTweet,
}: TweetProperties) => {
  const { data: referencedTweetData, error } = api.twitter.getTweet.useQuery(
    {
      id: referencedTweet ?? "",
    },
    { enabled: !!referencedTweet }
  );
  return (
    <TweetWrapper isQuoteTweet={isQuoteTweet}>
      {!hidden && (
        <div className="flex items-center pb-4 ">
          <div className="avatar">
            <div className="bg-neutral w-12 rounded-full">
              {avatar ? (
                <Image
                  src={avatar}
                  alt={`${username}s avatar`}
                  width="48"
                  height="48"
                />
              ) : (
                <div className="bg-secondary text-secondary-content flex h-full w-full items-center justify-center text-xl">
                  <ImageOff />
                </div>
              )}
            </div>
          </div>
          <div className="ml-4 flex flex-col text-base">
            <span className="font-bold">{username}</span>
            <span className="text-secondary">@{handle}</span>
          </div>
        </div>
      )}
      <p className="whitespace-pre-wrap" key={children}>
        <EntityHandler entities={entities}>{children}</EntityHandler>
      </p>
      {referencedTweetData && !error && (
        <div className="mt-4">
          <Tweet
            entities={referencedTweetData.data?.entities}
            avatar={
              referencedTweetData.includes?.users?.[0]?.profile_image_url ?? ""
            }
            username={referencedTweetData.includes?.users?.[0]?.name ?? ""}
            handle={referencedTweetData.includes?.users?.[0]?.username ?? ""}
            images={[]}
            key={referencedTweetData.data?.id}
            isQuoteTweet
            hidden={
              referencedTweetData.includes?.users?.[0]?.username === handle &&
              hidden
            }
          >
            {referencedTweetData.data?.text ?? ""}
          </Tweet>
        </div>
      )}
      {images.length > 0 && <ImageGrid images={images} className="mt-4" />}
    </TweetWrapper>
  );
};

export const TweetLoading = () => (
  <TweetWrapper>
    <progress className="progress progress-warning" />
  </TweetWrapper>
);
