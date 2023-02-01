import { useAtom } from "jotai";
import { type NextPage } from "next";
import Head from "next/head";
import { FaHeart, FaHeartBroken } from "react-icons/fa";
import { currentRoundAtom } from "../atoms/game";
import { GuessInput } from "../components/GuessInputs";
import { Stats } from "../components/Stats";
import { Timer } from "../components/Timer";
import { Tweet, TweetLoading } from "../components/Tweet";

import { api } from "../utils/api";

const Home: NextPage = () => {
  const [currentRound] = useAtom(currentRoundAtom);

  const randomTweet = api.twitter.getNextRound.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

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
            {randomTweet.data ? (
              <Tweet
                handle={randomTweet.data.user.username}
                username={randomTweet.data.user.name}
                avatar={randomTweet.data.user.profile_image_url}
              >
                {randomTweet.data.text}
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
