import { useAutoAnimate } from "@formkit/auto-animate/react";
import { ImageOff } from "lucide-react";
import Image from "next/image";
import type { PropsWithChildren } from "react";
import { type RouterOutputs } from "../utils/api";
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
};

const TweetWrapper = ({ children }: PropsWithChildren) => {
  const [animationParent] = useAutoAnimate();
  return (
    <div
      ref={animationParent}
      className="border-secondary bg-neutral text-neutral-content w-[598px] rounded-xl border p-4 shadow-xl"
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
}: TweetProperties) => {
  return (
    <TweetWrapper>
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
          <div className="ml-4 flex flex-col">
            <span className="font-bold">{username}</span>
            <span className="text-secondary">@{handle}</span>
          </div>
        </div>
      )}
      <p className="text-2xl" key={children}>
        <EntityHandler entities={entities}>{children}</EntityHandler>
      </p>
      {images.length > 0 && <ImageGrid images={images} className="mt-4" />}
    </TweetWrapper>
  );
};

export const TweetLoading = () => (
  <TweetWrapper>
    <progress className="progress progress-warning" />
  </TweetWrapper>
);
