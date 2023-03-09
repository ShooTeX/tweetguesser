import { type NextPage } from "next";
import { useState } from "react";
import { api } from "../utils/api";
import { useRouter } from "next/router";
import { Logo } from "../components/logo";
import type { UsernamesInputData } from "../components/usernames-input";
import { UsernamesInput } from "../components/usernames-input";
import { AlertCircle, Bomb, Heart, XCircle } from "lucide-react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  gameConfigAtom,
  gameModeSchema,
  tweetIdsAtom,
  usernamesAtom,
} from "../atoms/game";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Settings } from "../components/settings";
import { getEndTime } from "../utils/get-end-time";
import clsx from "clsx";
import { clamp, equals } from "remeda";
import arrayShuffle from "array-shuffle";
import type { InvalidUser } from "../server/api/routers/twitter/procedures/get-tweets-by-username";

const Home: NextPage = () => {
  const router = useRouter();
  const [animationParent] = useAutoAnimate();
  const { endTime, gameMode } = useAtomValue(gameConfigAtom);
  const setGameConfig = useSetAtom(gameConfigAtom);

  const [usernames, setUsernames] = useAtom(usernamesAtom);
  const [tweetIds, setTweetIds] = useAtom(tweetIdsAtom);
  const [getFollowing, setGetFollowing] = useState<string>();
  const [getListMembers, setGetListMembers] = useState<string>();
  const [invalidUsers, setInvalidUsers] = useState<InvalidUser[]>([]);

  const { data, error, isFetching, refetch } =
    api.twitter.getTweetsByUsernames.useQuery(
      { usernames: usernames, endTime: getEndTime(endTime) },
      {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        enabled: false,
      }
    );

  const { data: following, isFetching: isFollowingFetching } =
    api.twitter.getRandomFollowing.useQuery(
      { username: getFollowing || "" },
      {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        enabled: !!getFollowing,
      }
    );

  const { data: listMembers, isFetching: isListMembersFetching } =
    api.twitter.getListMembers.useQuery(
      { id: getListMembers || "" },
      {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        enabled: !!getListMembers,
      }
    );

  const {
    isFetching: getSpecifiedTweetsFetching,
    refetch: fetchSpecifiedTweets,
    error: getSpecifiedTweetsError,
  } = api.twitter.getTweets.useQuery(
    { ids: tweetIds },
    {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      enabled: false,
    }
  );

  if (getListMembers && listMembers?.length) {
    const truncListMembers = [...listMembers];
    truncListMembers.length = clamp(truncListMembers.length, { max: 20 });
    setGetListMembers(undefined);
    setUsernames(truncListMembers);
  }

  if (getFollowing && following?.length && !equals(usernames, following)) {
    const randomFollowing = [...arrayShuffle(following)];
    randomFollowing.length = clamp(randomFollowing.length, { max: 20 });
    setGetFollowing(undefined);
    setUsernames(randomFollowing);
  }

  if (data?.invalidUsers?.length) {
    const newInvalidUsers = data.invalidUsers.filter(
      (user) =>
        !invalidUsers.some((cachedUser) => user.handle === cachedUser.handle)
    );

    if (newInvalidUsers.length > 0) {
      setInvalidUsers((users) => [...users, ...newInvalidUsers]);
    }
  }

  const usernamesAreValid = usernames.every(
    (username) =>
      !invalidUsers.some(({ handle }) => handle.toLowerCase() === username)
  );

  const usernamesIncludeForbidden = usernames.some((username) =>
    invalidUsers.some(
      ({ handle, reason }) =>
        handle.toLowerCase() === username && reason === "forbidden"
    )
  );

  const usernamesIncludeEmpty = usernames.some((username) =>
    invalidUsers.some(
      ({ handle, reason }) =>
        handle.toLowerCase() === username && reason === "empty"
    )
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
    if (gameMode === "tweets") {
      const { data } = await fetchSpecifiedTweets();

      if (data?.tweets && data.tweets.length > 0) {
        void router.push("/game");
      }
    }
  };

  const handleUsernamesInput = ({ input, mode }: UsernamesInputData) => {
    if (mode === "following") {
      setGetFollowing(input);
      return;
    }

    if (mode === "list") {
      setGetListMembers(input);
      return;
    }

    if (usernames.includes(input.toLowerCase())) {
      return;
    }

    setUsernames((usernames) => [...usernames, input.toLowerCase()]);
  };

  const handleUsernameClick = (input: string) => {
    setUsernames((usernames) =>
      usernames.filter((username) => username !== input)
    );
  };

  const resetEmptyUsernames = () => {
    setInvalidUsers((users) => users.filter((user) => user.reason !== "empty"));
  };

  return (
    <>
      <div className="hero bg-base-200 min-h-screen ">
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
              "card bg-base-100 shrink-0 shadow-xl",
              gameModeSchema.options[0] === gameMode && "rounded-tl-none"
            )}
          >
            <div className="card-body min-w-[30rem]" ref={animationParent}>
              {gameMode === "handles" && (
                <>
                  <UsernamesInput
                    loading={isFollowingFetching || isListMembersFetching}
                    disabled={usernames.length >= 20}
                    onSubmit={(data) => {
                      handleUsernamesInput(data);
                    }}
                  />
                  {!!usernames?.length && (
                    <div
                      className="flex w-0 min-w-full flex-wrap gap-1"
                      ref={animationParent}
                    >
                      {usernames.map((username) => (
                        <div
                          className={clsx(
                            "badge cursor-pointer",
                            invalidUsers.some(
                              ({ handle, reason }) =>
                                handle.toLowerCase() === username &&
                                reason === "forbidden"
                            ) && "badge-error",
                            invalidUsers.some(
                              ({ handle, reason }) =>
                                handle.toLowerCase() === username &&
                                reason === "empty"
                            ) && "badge-warning"
                          )}
                          key={username}
                          onClick={() => handleUsernameClick(username)}
                        >
                          {username}
                        </div>
                      ))}
                      <button
                        className="badge badge-outline badge-error cursor-pointer"
                        onClick={() => setUsernames([])}
                      >
                        <Bomb size={14} className="mr-1" /> remove all
                      </button>
                    </div>
                  )}
                  {!!error ||
                    (usernamesIncludeForbidden && (
                      <div className="alert alert-error mt-4 shadow-lg">
                        <div>
                          <XCircle></XCircle>
                          <span>
                            {error
                              ? "An unknown error occured"
                              : "One or more usernames are invalid"}
                          </span>
                        </div>
                      </div>
                    ))}
                  {!!error ||
                    (usernamesIncludeEmpty && (
                      <div className="alert alert-warning mt-4 shadow-lg">
                        <div>
                          <AlertCircle />
                          <span>
                            One or more usernames don&apos;t have tweets
                            <br />
                            Try tweaking the settings or remove the username
                          </span>
                        </div>
                      </div>
                    ))}
                  {usernames.length === 0 && (
                    <>
                      <div className="divider">Or try a list</div>
                      <div
                        onClick={() => setGetListMembers("1629851852270448645")}
                        className={clsx(
                          "card card-compact card-bordered",
                          "border-primary text-neutral-content bg-neutral w-full",
                          "cursor-pointer transition-all ease-in-out hover:shadow-xl"
                        )}
                      >
                        <div className="card-body">
                          <h2 className="card-title">TechNerds</h2>
                          <p>Just a bunch of nerds...</p>
                        </div>
                      </div>
                    </>
                  )}
                  <div className="divider">Settings</div>
                  <Settings onEndTimeChange={() => resetEmptyUsernames()} />
                </>
              )}
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
                  {getSpecifiedTweetsError && (
                    <div className="alert alert-error mt-4 shadow-lg">
                      <div>
                        <XCircle></XCircle>
                        <span>Something went wrong :(</span>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div className="form-control mt-6">
                <button
                  className={clsx([
                    "btn-primary btn-lg btn",
                    (isFetching || getSpecifiedTweetsFetching) && "loading",
                  ])}
                  disabled={
                    (gameMode === "handles" &&
                      (!usernames ||
                        usernames.length < 2 ||
                        !usernamesAreValid ||
                        isFetching)) ||
                    (gameMode === "tweets" &&
                      (tweetIds.length < 2 || getSpecifiedTweetsFetching))
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
