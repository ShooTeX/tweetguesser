import { type NextPage } from "next";
import Head from "next/head";
import { FaHeart, FaHeartBroken } from "react-icons/fa";
import { Timer } from "../components/Timer";
import { Tweet, TweetLoading } from "../components/Tweet";

import { api } from "../utils/api";

const Home: NextPage = () => {
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
        <div className="py-4">
          <div className="stats shadow">
            <div className="stat w-48 place-items-center bg-neutral">
              <div className="stat-title">Score</div>
              <div className="stat-value text-primary">0</div>
            </div>
            <div className="stat place-items-center bg-neutral">
              <div className="stat-title">Round</div>
              <div className="stat-value">1/10</div>
            </div>
            <div className="stat place-items-center bg-neutral">
              <div className="stat-title">Highscore</div>
              <div className="stat-value">0</div>
            </div>
          </div>
        </div>
        <ul className="steps">
          <li data-content="✓" className="step-neutral step"></li>
          <li data-content="✕" className="step-neutral step"></li>
          <li data-content="" className="step-neutral step"></li>
          <li data-content="" className="step-neutral step"></li>
          <li data-content="" className="step-neutral step"></li>
          <li data-content="" className="step-neutral step"></li>
          <li data-content="" className="step-neutral step"></li>
          <li data-content="" className="step-neutral step"></li>
          <li data-content="" className="step-neutral step"></li>
          <li data-content="" className="step-neutral step"></li>
        </ul>
        <div className="flex flex-grow flex-col justify-center">
          <Timer active />
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
        <div className="flex w-[598px] items-center py-4">
          <input
            type="text"
            placeholder="Your Guess"
            className="input mr-4 flex-1 bg-neutral"
          />
          <div className="flex space-x-1 text-lg">
            <FaHeartBroken className="text-error" />
            <FaHeart className="text-success" />
            <FaHeart className="text-success" />
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
