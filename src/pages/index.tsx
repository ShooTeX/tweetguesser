import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import { api } from "../utils/api";

const Home: NextPage = () => {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });
  // const randomTweet = api.twitter.getNextRound.useQuery();

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
              <div className="stat-title">Points</div>
              <div className="stat-value text-primary">0</div>
            </div>
            <div className="stat place-items-center bg-neutral">
              <div className="stat-title">Round</div>
              <div className="stat-value">1/10</div>
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
          <div className="h-8 h-80 w-[598px] bg-neutral"></div>
        </div>
        <div className="flex w-[598px] p-4">
          <input
            type="text"
            placeholder="Your Guess"
            className="input mt-4 mr-4 flex-1 bg-neutral"
          />
          <div>
            <span>H</span>
            <span>H</span>
            <span>H</span>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
