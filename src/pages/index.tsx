import { useAtom } from "jotai";
import { RESET } from "jotai/utils";
import { type NextPage } from "next";
import Head from "next/head";
import { useEffect } from "react";
import { FaHeart, FaHeartBroken } from "react-icons/fa";
import { currentRoundAtom } from "../atoms/game";
import { GuessInput } from "../components/GuessInputs";
import { Stats } from "../components/Stats";
import { Timer } from "../components/Timer";
import { Tweet, TweetLoading } from "../components/Tweet";

import { api } from "../utils/api";

const Home: NextPage = () => {
  const [currentRound, setCurrentRound] = useAtom(currentRoundAtom);

  const { data: randomTweet } = api.twitter.getNextRound.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  useEffect(() => {
    if (randomTweet) {
      setCurrentRound(RESET);
      setCurrentRound((round) => ({
        ...round,
        possibleAnswers: [...randomTweet.possibleNames],
      }));
    }
  }, [randomTweet, setCurrentRound]);

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
            {randomTweet ? (
              <Tweet
                handle={randomTweet.user.username}
                username={randomTweet.user.name}
                avatar={randomTweet.user.profile_image_url}
              >
                {randomTweet.text}
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
