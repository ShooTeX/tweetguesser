import { type NextPage } from "next";
import Head from "next/head";
import { GuessInput } from "../../components/GuessInputs";
import { Stats } from "../../components/Stats";
import { Tweet, TweetLoading } from "../../components/Tweet";
import { api } from "../../utils/api";
import { useRouter } from "next/router";
import { z } from "zod";
import { useState } from "react";
import type { Round } from "../../types/round";

const Game: NextPage = () => {
  const router = useRouter();
  const { usernames } = router.query;

  if (!usernames && router.isReady) {
    void router.replace("/");
  }

  const parsedUsernames =
    router.isReady && z.array(z.string()).parse(usernames);

  const { data: tweets, error } = api.twitter.getTweets.useQuery(
    parsedUsernames || [],
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: false,
      enabled: !!parsedUsernames,
    }
  );

  if (router.isReady && error) {
    void router.replace("/");
  }

  const [currentRound, setCurrentRound] = useState(0);
  const [tries, setTries] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [history, setHistory] = useState<Round[]>([]);
  const currentTweet = tweets && tweets[currentRound];
  const gameover = tweets?.length === currentRound;

  const reset = () => {
    setReveal(false);
    setTries(0);
    if (!gameover) {
      setCurrentRound(currentRound + 1);
    }
  };

  const endRound = (giveup = false) => {
    if (giveup) {
      setHistory([...history, { score: 0 }]);
    } else {
      setHistory([...history, { score: 2 - tries >= 0 ? (3 - tries) * 5 : 1 }]);
    }

    setReveal(true);

    setTimeout(() => {
      reset();
    }, 3000);
  };

  const score = history.reduce((prev, round) => prev + round.score, 0);

  return (
    <>
      <Head>
        <title>Twitter Guessr</title>
        <meta name="description" content="Twitter Guessr" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center">
        {history && <Stats score={score} round={currentRound + 1} />}
        <div className="flex flex-grow flex-col justify-center">
          <div className="stack mt-4 transition-all ease-in-out">
            {currentTweet ? (
              <Tweet
                handle={currentTweet.username}
                username={currentTweet.name}
                avatar={currentTweet.profile_image_url}
                hidden={!reveal}
              >
                {currentTweet.text}
              </Tweet>
            ) : (
              <TweetLoading />
            )}
          </div>
        </div>
        <div className="flex w-[598px] items-center py-4">
          <GuessInput
            onCorrect={() => endRound()}
            onIncorrect={() => setTries(tries + 1)}
            possibleAnswers={
              currentTweet ? [currentTweet.username, currentTweet.name] : []
            }
            disabled={!currentTweet || reveal}
            key={currentTweet?.id}
          />
          <button
            type="button"
            className="btn-error btn text-error-content"
            onClick={() => endRound(true)}
            disabled={!currentTweet || reveal}
          >
            give up
          </button>
        </div>
      </main>
    </>
  );
};

export default Game;
