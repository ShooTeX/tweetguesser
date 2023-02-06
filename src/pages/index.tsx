import { type NextPage } from "next";
import Head from "next/head";
import { GuessInput } from "../components/GuessInputs";
import { Stats } from "../components/Stats";
import { Timer } from "../components/Timer";
import { Tweet, TweetLoading } from "../components/Tweet";

import { useEffect, useState } from "react";
import { Lives } from "../components/Lives";
import type { Round } from "../types/round";
import { api } from "../utils/api";
import { gameConfigAtom } from "../atoms/game";
import { useAtom } from "jotai";
import { Modal } from "../components/Modal";
import { StartScreen } from "../components/StartScreen";

const defaultRound: Readonly<Round> = {
  status: "pending",
  possibleAnswers: [],
  tries: 0,
  score: 0,
};

const Home: NextPage = () => {
  const [gameStart, setGameStart] = useState(false);
  const [showStartScreen, setShowStartScreen] = useState(false);
  const [currentRound, setCurrentRound] = useState<Round>({
    ...defaultRound,
    status: "init",
  });
  const [rounds, setRounds] = useState<Round[]>([]);
  const [config] = useAtom(gameConfigAtom);
  const gameover = rounds.length === config.maxRounds;

  const {
    data: tweet,
    isFetching,
    refetch,
  } = api.twitter.getNextTweet.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled: gameStart && !gameover,
  });

  const endRound = (gameover = false) => {
    const updatedRound: Round = {
      ...currentRound,
      status: "done",
      score: gameover
        ? 0
        : !config.endless
        ? (config.maxLives - currentRound.tries) * config.pointsPerLive
        : 1,
    };
    setCurrentRound(updatedRound);
    setRounds((rounds) => [...rounds, updatedRound]);

    if (rounds.length + 1 !== config.maxRounds) {
      setTimeout(() => {
        void initNewRound();
      }, 3000);
    }
  };

  const initNewRound = async () => {
    setCurrentRound(defaultRound);
    const { data, error } = await refetch();
    if (error || !data) {
      throw error || "something went wrong";
    }

    setCurrentRound((round) => ({
      ...round,
      status: "playing",
      possibleAnswers: data.possibleNames,
    }));
  };

  const handleIncorrectGuess = () => {
    if (currentRound.tries === config.maxLives - 1) {
      endRound(true);
      return;
    }
    setCurrentRound((round) => ({ ...round, tries: round.tries + 1 }));
  };

  if (tweet && currentRound.status === "init") {
    setCurrentRound((round) => ({
      ...round,
      status: "playing",
      possibleAnswers: tweet.possibleNames,
    }));
  }

  useEffect(() => {
    setShowStartScreen(true);
  }, []);

  return (
    <>
      <Head>
        <title>Twitter Guessr</title>
        <meta name="description" content="Twitter Guessr" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {
        <Modal show={showStartScreen}>
          <StartScreen
            onPlay={() => {
              setShowStartScreen(false);
              setGameStart(true);
            }}
          />
        </Modal>
      }
      <main className="flex min-h-screen flex-col items-center">
        <Stats rounds={rounds} />
        <div className="flex flex-grow flex-col justify-center">
          {!config.endless && (
            <Timer
              onTimesUp={() => endRound(true)}
              active={currentRound.status === "playing" && !gameover}
            />
          )}
          <div className="stack mt-4 transition-all ease-in-out">
            {tweet && !isFetching ? (
              <Tweet
                handle={tweet.user.username}
                username={tweet.user.name}
                avatar={tweet.user.profile_image_url}
                hidden={currentRound.status !== "done"}
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
            onCorrect={endRound}
            onIncorrect={handleIncorrectGuess}
            possibleAnswers={currentRound.possibleAnswers}
            disabled={currentRound.status !== "playing" || gameover}
            key={currentRound.possibleAnswers.toString()}
          />
          {!config.endless ? (
            <Lives tries={currentRound.tries} />
          ) : (
            <button
              type="button"
              className="btn-error btn text-error-content"
              onClick={() => endRound(true)}
              disabled={currentRound.status !== "playing" || gameover}
            >
              give up
            </button>
          )}
        </div>
      </main>
    </>
  );
};

export default Home;
