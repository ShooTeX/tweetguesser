import { useAtom } from "jotai";
import { RESET } from "jotai/utils";
import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { currentRoundAtom, roundsAtom } from "../atoms/game";
import { GuessInput } from "../components/GuessInputs";
import { Stats } from "../components/Stats";
import { Timer } from "../components/Timer";
import { Tweet, TweetLoading } from "../components/Tweet";

import { api } from "../utils/api";
import type { RouterOutputs } from "../utils/api";
import { useImmerAtom } from "jotai-immer";

const Home: NextPage = () => {
  const [currentRound, setCurrentRound] = useAtom(currentRoundAtom);
  const [rounds, setRounds] = useImmerAtom(roundsAtom);
  const [currentTweet, setCurrentTweet] = useState<
    RouterOutputs["twitter"]["getNextTweet"] | undefined
  >();

  const { data, refetch } = api.twitter.getNextTweet.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const initNewRound = async () => {
    setRounds((draft) => {
      draft.push(currentRound);
    });
    setCurrentRound(RESET);
    await refetch();
  };

  if (data && data !== currentTweet) {
    setCurrentTweet(data);
    setCurrentRound((round) => ({
      ...round,
      status: "playing",
      possibleAnswers: [...data.possibleNames],
    }));
  }

  return (
    <>
      <Head>
        <title>Twitter Guessr</title>
        <meta name="description" content="Twitter Guessr" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center">
        <Stats />
        <div className="flex flex-grow flex-col justify-center">
          <Timer active={currentRound.status === "playing"} />
          <div className="stack mt-4 transition-all ease-in-out">
            {currentTweet ? (
              <Tweet
                handle={currentTweet.user.username}
                username={currentTweet.user.name}
                avatar={currentTweet.user.profile_image_url}
              >
                {currentTweet.text}
              </Tweet>
            ) : (
              <TweetLoading />
            )}
          </div>
        </div>
        <GuessInput />
      </main>
    </>
  );
};

export default Home;
