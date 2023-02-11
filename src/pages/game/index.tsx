import { type NextPage } from "next";
import { GuessInput } from "../../components/GuessInputs";
import { Stats } from "../../components/Stats";
import { Tweet, TweetLoading } from "../../components/Tweet";
import { api } from "../../utils/api";
import { useRouter } from "next/router";
import { z } from "zod";
import { useState } from "react";
import type { Round } from "../../types/round";
import { Logo } from "../../components/Logo";
import { Timer } from "../../components/Timer";
import { Modal } from "../../components/Modal";
import Link from "next/link";

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
  const [gameTimeout, setGameTimeout] = useState(false);
  const currentTweet = tweets && tweets[currentRound];
  const gameover = tweets?.length === currentRound || gameTimeout;
  const correctlyAnswered = history.filter((item) => item.score > 0);

  const reset = () => {
    if (!gameover) {
      setReveal(false);
      setTries(0);
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
    }, 1500);
  };

  const score = history.reduce((prev, round) => prev + round.score, 0);

  return (
    <>
      <Modal show={gameover}>
        <div className="modal modal-open">
          <div className="modal-box w-auto">
            <h2 className="text-center text-3xl font-bold uppercase text-secondary">
              Gameover
            </h2>
            <div className="mt-8 flex items-center justify-center space-x-2">
              <div
                className="radial-progress bg-neutral font-bold text-primary"
                style={
                  {
                    "--value":
                      (correctlyAnswered.length / (tweets?.length || 0)) * 100,
                  } as React.CSSProperties
                }
              >
                {correctlyAnswered.length}/{tweets?.length || 0}
              </div>
              <div className="stats">
                <div className="stat w-48 place-items-center bg-neutral">
                  <div className="stat-title">Score</div>
                  <div className="stat-value font-mono text-primary">
                    {score}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 flex flex-col space-y-2">
              <button
                type="button"
                onClick={() => {
                  router.reload();
                }}
                className="btn btn-primary"
              >
                play again
              </button>
              <Link href="/" className="btn-outline btn">
                change users
              </Link>
            </div>
          </div>
        </div>
      </Modal>
      <main className="flex min-h-screen flex-col items-center">
        <div className="flex w-full flex-col items-center justify-center p-4">
          <span>
            <Logo />
          </span>
          <div className="mt-1">
            {history && <Stats score={score} round={currentRound + 1} />}
          </div>
          <span className="mt-1 text-sm">
            build by{" "}
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
        <div className="flex flex-grow flex-col justify-center">
          <Timer
            onTimesUp={() => {
              setGameTimeout(true);
            }}
            active={!gameover}
          />
          <div className="stack mt-4 transition-all ease-in-out">
            {currentTweet ? (
              <Tweet
                images={currentTweet.images}
                handle={currentTweet.username}
                username={currentTweet.name}
                avatar={currentTweet.profile_image_url}
                hidden={!reveal}
                entities={currentTweet.entities}
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
            className="btn btn-error text-error-content"
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
