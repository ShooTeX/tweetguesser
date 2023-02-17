import { type NextPage } from "next";
import { GuessInput } from "../../components/GuessInputs";
import { Stats } from "../../components/Stats";
import { Tweet, TweetLoading } from "../../components/Tweet";
import { api } from "../../utils/api";
import { useRouter } from "next/router";
import { useState } from "react";
import type { Round } from "../../types/round";
import { Logo } from "../../components/Logo";
import { Timer } from "../../components/Timer";
import { Modal } from "../../components/Modal";
import Link from "next/link";
import { useAtomValue } from "jotai";
import { gameConfigAtom, usernamesAtom } from "../../atoms/game";

const Game: NextPage = () => {
  const router = useRouter();
  const usernames = useAtomValue(usernamesAtom);
  const { endless } = useAtomValue(gameConfigAtom);

  const { data, error } = api.twitter.getTweets.useQuery(usernames, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  });

  if (
    router.isReady &&
    (!usernames.length || error || data?.invalidUsernames?.length)
  ) {
    void router.replace("/");
  }

  const tweets = data?.tweets;

  const [currentRound, setCurrentRound] = useState(0);
  const [tries, setTries] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [history, setHistory] = useState<Round[]>([]);
  const [gameTimeout, setGameTimeout] = useState(false);
  const [showGiveUp, setShowGiveUp] = useState(false);
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

  const endRound = (skip = false) => {
    if (skip) {
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
                className="btn-primary btn"
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
      <Modal show={showGiveUp && !gameover}>
        <div className="modal modal-open modal-bottom sm:modal-middle">
          <div className="modal-box">
            <h3 className="text-lg font-bold">Giveup</h3>
            <p className="py-4">Are you sure you want to give up?</p>
            <div className="modal-action">
              <button
                type="button"
                className="btn-outline btn"
                onClick={() => setShowGiveUp(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-error btn"
                onClick={() => {
                  setGameTimeout(true);
                  setShowGiveUp(false);
                }}
              >
                Give up
              </button>
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
            built by{" "}
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
          {!endless && !!data?.tweets.length && (
            <Timer
              onTimesUp={() => {
                setGameTimeout(true);
              }}
              active={!gameover}
            />
          )}
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
        <div className="flex w-[598px] flex-col py-4">
          <div className="flex w-full items-center">
            <div className="mr-4 flex-1">
              <GuessInput
                onSkip={() => endRound(true)}
                onCorrect={() => endRound()}
                onIncorrect={() => setTries(tries + 1)}
                possibleAnswers={
                  currentTweet ? [currentTweet.username, currentTweet.name] : []
                }
                disabled={!currentTweet || reveal}
                key={currentTweet?.id}
              />
            </div>
            <button
              type="button"
              className="btn-error btn text-error-content"
              onClick={() => setShowGiveUp(true)}
              disabled={!currentTweet || reveal}
            >
              give up
            </button>
          </div>
          <div className="mt-2 flex space-x-5">
            <div>
              <kbd className="kbd kbd-sm">⏎</kbd>
              <span> guess</span>
            </div>
            <div>
              <kbd className="kbd kbd-sm">Ctrl</kbd>{" "}
              <kbd className="kbd kbd-sm">s</kbd>
              <span> skip</span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Game;
