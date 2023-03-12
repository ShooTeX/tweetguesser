import { type NextPage } from "next";
import { useState } from "react";
import { api } from "../utils/api";
import { useRouter } from "next/router";
import { Logo } from "../components/logo";
import { Heart } from "lucide-react";
import {
  addInvalidUsernamesAtom,
  gameConfigAtom,
  gameModeSchema,
  tweetIdsAtom,
  usernamesAtom,
} from "../atoms/game";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { getEndTime } from "../utils/get-end-time";
import clsx from "clsx";
import type { InvalidUser } from "../server/api/routers/twitter/procedures/get-tweets-by-username";
import { HandleInput } from "../components/handle-input";
import { HandleList } from "../components/handle-list";

const HandleTab = () => {
  return (
    <div>
      <HandleInput />
      <HandleList />
    </div>
  );
};

const Home: NextPage = () => {
  const router = useRouter();
  const { endTime, gameMode } = useAtomValue(gameConfigAtom);
  const usernames = useAtomValue(usernamesAtom);
  const addInvalidUsernames = useSetAtom(addInvalidUsernamesAtom);
  const setGameConfig = useSetAtom(gameConfigAtom);

  const [tweetIds, setTweetIds] = useAtom(tweetIdsAtom);
  const [invalidUsernames, setInvalidUsers] = useState<InvalidUser[]>([]);

  const { data, isFetching, refetch } =
    api.twitter.getTweetsByUsernames.useQuery(
      { usernames: usernames, endTime: getEndTime(endTime) },
      {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        enabled: false,
        onSuccess: (data) => {
          if (data?.invalidUsers?.length) {
            addInvalidUsernames(data.invalidUsers.map((user) => user.handle));
          }
        },
      }
    );

  // const {
  //   isFetching: getSpecifiedTweetsFetching,
  //   refetch: fetchSpecifiedTweets,
  //   error: getSpecifiedTweetsError,
  // } = api.twitter.getTweets.useQuery(
  //   { ids: tweetIds },
  //   {
  //     retry: false,
  //     refetchOnWindowFocus: false,
  //     refetchOnMount: false,
  //     enabled: false,
  //   }
  // );

  const usernamesAreValid = usernames.every(
    (username) =>
      !invalidUsernames.some(({ handle }) => handle.toLowerCase() === username)
  );

  const handlePlay = async () => {
    if (gameMode === "handles") {
      if (!data?.invalidUsers?.length && data?.tweets.length) {
        void router.push("/game");
      }

      const { data: refetchData } = await refetch();

      if (!refetchData?.invalidUsers?.length && refetchData?.tweets.length) {
        void router.push("/game");
      }
    }
    // if (gameMode === "tweets") {
    //   const { data } = await fetchSpecifiedTweets();
    //
    //   if (data?.tweets && data.tweets.length > 0) {
    //     void router.push("/game");
    //   }
    // }
  };

  return (
    <>
      <div className="hero bg-base-200 min-h-screen">
        <div className="hero-content flex-col gap-0">
          <Logo />
          <div className="tabs mt-4 w-full capitalize">
            {gameModeSchema.options.map((mode) => (
              <a
                className={clsx(
                  "tab tab-lifted tab-border-none",
                  mode === gameMode && "tab-active"
                )}
                key={mode}
                onClick={() =>
                  setGameConfig((config) => ({ ...config, gameMode: mode }))
                }
              >
                {mode}
                {mode === "tweets" && (
                  <span className="badge badge-sm ml-1">beta</span>
                )}
              </a>
            ))}
          </div>
          <div
            className={clsx(
              "card bg-base-100 w-[425px] shrink-0 shadow-xl",
              gameModeSchema.options[0] === gameMode && "rounded-tl-none"
            )}
          >
            <div className="card-body">
              {gameMode === "handles" && <HandleTab />}
              {gameMode === "tweets" && (
                <>
                  <div className="form-control">
                    <textarea
                      className="textarea textarea-primary"
                      value={tweetIds.join("\n")}
                      onChange={(event) =>
                        setTweetIds(
                          event.target.value
                            .split("\n")
                            .map((value) => value.trim())
                        )
                      }
                    />
                    <label className="label">
                      <span className="label-text-alt">
                        Tweet ids seperated by linebreak
                      </span>
                    </label>
                  </div>
                  {/* {getSpecifiedTweetsError && ( */}
                  {/*   <div className="alert alert-error mt-4 shadow-lg"> */}
                  {/*     <div> */}
                  {/*       <XCircle></XCircle> */}
                  {/*       <span>Something went wrong :(</span> */}
                  {/*     </div> */}
                  {/*   </div> */}
                  {/* )} */}
                </>
              )}
              <div className="form-control mt-6">
                <button
                  className={clsx([
                    "btn-primary btn-lg btn",
                    isFetching && "loading",
                  ])}
                  disabled={
                    gameMode === "handles" &&
                    (!usernames ||
                      usernames.length < 2 ||
                      !usernamesAreValid ||
                      isFetching)
                  }
                  onClick={handlePlay}
                >
                  Play
                </button>
              </div>
            </div>
          </div>
          <span className="mt-4 text-sm">
            <Heart className="inline" /> built by{" "}
            <a
              href="https://twitter.com/imshootex"
              target="_blank"
              rel="noreferrer"
              className="link-hover link-info link font-bold"
            >
              @imShooTeX
            </a>
          </span>
        </div>
      </div>
    </>
  );
};

export default Home;
