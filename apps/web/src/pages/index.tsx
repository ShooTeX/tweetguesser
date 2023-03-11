import { type NextPage } from "next";
import { useState } from "react";
import { api } from "../utils/api";
import { useRouter } from "next/router";
import { Logo } from "../components/logo";
import type { UsernamesInputData } from "../components/usernames-input";
import { AtSign, Heart, XCircle } from "lucide-react";
import {
  gameConfigAtom,
  gameModeSchema,
  tweetIdsAtom,
  usernamesAtom,
} from "../atoms/game";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { getEndTime } from "../utils/get-end-time";
import clsx from "clsx";
import { clamp, equals } from "remeda";
import arrayShuffle from "array-shuffle";
import type { InvalidUser } from "../server/api/routers/twitter/procedures/get-tweets-by-username";
import { z } from "zod";
import isAlphanumeric from "validator/lib/isAlphanumeric";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";

const HandleTab = () => {
  const updateUsernames = useSetAtom(usernamesAtom);
  const handleSchema = z.object({
    handle: z
      .string()
      .refine((value) => isAlphanumeric(value, undefined, { ignore: "_" })),
  });

  type HandleData = z.infer<typeof handleSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HandleData>({
    resolver: zodResolver(handleSchema),
    mode: "onSubmit",
    delayError: 100,
    shouldUnregister: true,
  });

  const onSubmit = (data: HandleData) => {
    updateUsernames((usernames) => [...usernames, data.handle]);
    console.log(data);
    reset();
  };

  return (
    <form className="form-control w-full" onSubmit={handleSubmit(onSubmit)}>
      <div className={clsx("relative", errors.handle && "animate-wiggle")}>
        <label className="input-group">
          <span>
            <AtSign size={16} />
          </span>
          <input
            type="text"
            autoFocus
            className="input-bordered input-primary input flex-1 shrink-0"
            {...register("handle")}
          />
        </label>
        <div className="absolute inset-y-0 right-4 flex flex-col justify-center">
          <kbd className="kbd">⏎</kbd>
        </div>
      </div>
      <AnimatePresence>
        {errors.handle && (
          <motion.label
            key="error"
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{ ease: "easeInOut" }}
          >
            <span className="label-text-alt text-error">
              {errors.handle.message}
            </span>
          </motion.label>
        )}
      </AnimatePresence>
    </form>
  );
};

const Home: NextPage = () => {
  const router = useRouter();
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
