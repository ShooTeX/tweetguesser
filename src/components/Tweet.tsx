import { useAutoAnimate } from "@formkit/auto-animate/react";
import Image from "next/image";
import type { PropsWithChildren } from "react";
import { FaQuestion } from "react-icons/fa";
import { type RouterOutputs } from "../utils/api";
import { EntityHandler } from "./EntityHandler";
import { ImageGrid } from "./ImageGrid";

export type TweetProps = {
  avatar?: string;
  username: string;
  handle: string;
  children: string;
  hidden?: boolean;
  images: RouterOutputs["twitter"]["getTweets"][0]["images"];
  entities: RouterOutputs["twitter"]["getTweets"][0]["entities"];
};

const TweetWrapper = ({ children }: PropsWithChildren) => {
  const [animationParent] = useAutoAnimate();
  return (
    <div
      ref={animationParent}
      className="w-[598px] rounded-xl border border-secondary bg-neutral p-4 text-neutral-content shadow-xl"
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
}: TweetProps) => {
  return (
    <TweetWrapper>
      {!hidden && (
        <div className="flex items-center pb-4 ">
          <div className="avatar">
            <div className="w-12 rounded-full bg-neutral">
              {avatar ? (
                <Image
                  src={avatar}
                  alt={`${username}s avatar`}
                  width="48"
                  height="48"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-secondary text-xl text-secondary-content">
                  <FaQuestion />
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
