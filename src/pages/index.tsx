import { type NextPage } from "next";
import Head from "next/head";
import { GuessInput } from "../components/GuessInputs";
import { Stats } from "../components/Stats";
import { Timer } from "../components/Timer";
import { Tweet, TweetLoading } from "../components/Tweet";

import { api } from "../utils/api";
import { Lives } from "../components/Lives";

const Home: NextPage = () => {
  const { data: tweet, isFetching } = api.twitter.getNextTweet.useQuery(
    undefined,
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  return (
    <>
      <Head>
        <title>Twitter Guessr</title>
        <meta name="description" content="Twitter Guessr" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center">
        <Stats rounds={[]} />
        <div className="flex flex-grow flex-col justify-center">
          <Timer onTimesUp={() => {}} />
          <div className="stack mt-4 transition-all ease-in-out">
            {tweet && !isFetching ? (
              <Tweet
                handle={tweet.user.username}
                username={tweet.user.name}
                avatar={tweet.user.profile_image_url}
              >
                {tweet.text}
              </Tweet>
            ) : (
              <TweetLoading />
            )}
          </div>
        </div>
        <div className="flex w-[598px] items-center py-4">
          <GuessInput
            onCorrect={() => {}}
            onIncorrect={() => {}}
            possibleAnswers={[]}
          />
          <Lives tries={1} />
        </div>
      </main>
    </>
  );
};

export default Home;
