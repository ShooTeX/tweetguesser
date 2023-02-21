import { type NextPage } from "next";
import { useState } from "react";
import { api } from "../utils/api";
import { useRouter } from "next/router";
import { Logo } from "../components/logo";
import type { UsernamesInputData } from "../components/usernames-input";
import { UsernamesInput } from "../components/usernames-input";
import { Bomb, Heart, XCircle } from "lucide-react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { gameConfigAtom, usernamesAtom } from "../atoms/game";
import { useAtom, useAtomValue } from "jotai";
import { Settings } from "../components/settings";
import { getEndTime } from "../utils/get-end-time";
import clsx from "clsx";
import { clamp, equals } from "remeda";
import arrayShuffle from "array-shuffle";

const Home: NextPage = () => {
  const router = useRouter();
  const [animationParent] = useAutoAnimate();
  const { endTime } = useAtomValue(gameConfigAtom);

  const [usernames, setUsernames] = useAtom(usernamesAtom);
  const [getFollowing, setGetFollowing] = useState<string>();
  const [invalidUsernames, setInvalidUsernames] = useState<string[]>([]);

  const { data, error, isFetching, refetch } = api.twitter.getTweets.useQuery(
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

  if (getFollowing && following?.length && !equals(usernames, following)) {
    const randomFollowing = [...arrayShuffle(following)];
    randomFollowing.length = clamp(randomFollowing.length, { max: 20 });
    setGetFollowing(undefined);
    setUsernames(randomFollowing);
  }

  if (data?.invalidUsernames?.length) {
    const newInvalidUsernames = data.invalidUsernames.filter(
      (username) => !invalidUsernames.includes(username)
    );

    if (newInvalidUsernames.length > 0) {
      setInvalidUsernames((usernames) => [
        ...usernames,
        ...newInvalidUsernames,
      ]);
    }
  }

  const usernamesAreValid = usernames.every(
    (username) => !invalidUsernames.includes(username)
  );

  const handlePlay = async () => {
    if (!data?.invalidUsernames?.length && data?.tweets.length) {
      void router.push("/game");
    }

    const { data: refetchData } = await refetch();

    if (!refetchData?.invalidUsernames?.length && refetchData?.tweets.length) {
      void router.push("/game");
    }
  };

  const handleUsernamesInput = ({ handle, mode }: UsernamesInputData) => {
    if (mode === "following") {
      setGetFollowing(handle);
      return;
    }

    if (usernames.includes(handle.toLowerCase())) {
      return;
    }

    setUsernames((usernames) => [...usernames, handle.toLowerCase()]);
  };

  const handleUsernameClick = (input: string) => {
    setUsernames((usernames) =>
      usernames.filter((username) => username !== input)
    );
  };

  return (
    <>
      <div className="hero bg-base-200 min-h-screen ">
        <div className="hero-content flex-col">
          <Logo />
          <div className="card bg-base-100 shrink-0 shadow-xl">
            <div className="card-body" ref={animationParent}>
              <UsernamesInput
                loading={isFollowingFetching}
                disabled={usernames.length >= 20}
                onSubmit={(data) => {
                  handleUsernamesInput(data);
                }}
              />
              {!!usernames?.length && (
                <div
                  className="flex max-w-sm grow-0 flex-wrap gap-1"
                  ref={animationParent}
                >
                  {usernames.map((username) => (
                    <div
                      className={`badge cursor-pointer ${
                        invalidUsernames.includes(username) ? "badge-error" : ""
                      }`}
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
                (!usernamesAreValid && (
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
              <div className="divider">Settings</div>
              <Settings />
              <div className="form-control mt-6">
                <button
                  className={clsx([
                    "btn-primary btn-lg btn",
                    isFetching && "loading",
                  ])}
                  disabled={
                    !usernames ||
                    usernames.length < 2 ||
                    !usernamesAreValid ||
                    isFetching
                  }
                  onClick={handlePlay}
                >
                  Play
                </button>
              </div>
            </div>
          </div>
          <span className="text-sm">
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
