import { type NextPage } from "next";
import { GuessInput } from "../../components/guess-inputs";
import { Stats } from "../../components/stats";
import { Tweet, TweetLoading } from "../../components/tweet";
import { api } from "../../utils/api";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import type { Round } from "../../types/round";
import { Logo } from "../../components/logo";
import { Timer } from "../../components/timer";
import { Modal } from "../../components/modal";
import { useAtom, useAtomValue } from "jotai";
import { gameConfigAtom, tweetIdsAtom, usernamesAtom } from "../../atoms/game";
import { Heart, Star, Twitter } from "lucide-react";
import { getEndTime } from "../../utils/get-end-time";
import arrayShuffle from "array-shuffle";
import Link from "next/link";
import clsx from "clsx";

const Game: NextPage = () => {
  const router = useRouter();
  const usernamesStorage = useAtomValue(usernamesAtom);
  const [tweetIds, setTweetIds] = useAtom(tweetIdsAtom);
  const { endless, endTime, gameMode } = useAtomValue(gameConfigAtom);

  const { data: handlesModeData } = api.twitter.getTweetsByUsernames.useQuery(
    { usernames: usernamesStorage, endTime: getEndTime(endTime) },
    {
      enabled: false,
    }
  );

  const { data: tweetsModeData } = api.twitter.getTweets.useQuery(
    { ids: tweetIds },
    {
      enabled: false,
    }
  );

  const data =
    (gameMode === "handles" && handlesModeData) ||
    (gameMode === "tweets" && tweetsModeData) ||
    undefined;

  // INFO: data should be in cache already
  if (router.isReady && !data) {
    void router.replace("/");
  }

  const usernames =
    gameMode === "handles"
      ? usernamesStorage
      : gameMode === "tweets"
      ? tweetsModeData?.usernames.map((username) => username.toLowerCase())
      : undefined;

  const rawTweets =
    gameMode === "handles"
      ? handlesModeData?.tweets
      : gameMode === "tweets"
      ? tweetsModeData?.tweets
      : undefined;

  const tweets = useMemo(
    () => (rawTweets?.length ? arrayShuffle(rawTweets) : undefined),
    [rawTweets]
  );

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

  const score = history.reduce((previous, round) => previous + round.score, 0);

  const handleStarClick = () => {
    if (!currentTweet) {
      return;
    }

    if (tweetIds.includes(currentTweet.id)) {
      setTweetIds((ids) => ids.filter((id) => id !== currentTweet.id));
      return;
    }

    setTweetIds((ids) => {
      if (ids.length === 1 && ids[0] === "") {
        return [currentTweet.id];
      }
      return [...ids, currentTweet?.id];
    });
  };

  return (
    <>
      <Modal show={gameover}>
        <div className="modal modal-open">
          <div className="modal-box w-auto">
            <h2 className="text-secondary text-center text-3xl font-bold uppercase">
              Gameover
            </h2>
            <div className="mt-8 flex items-center justify-center space-x-2">
              <div
                className="radial-progress bg-neutral text-primary font-bold"
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
                <div className="stat bg-neutral w-48 place-items-center">
                  <div className="stat-title">Score</div>
                  <div className="stat-value text-primary font-mono">
                    {score}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 flex space-x-1">
              <Link type="button" href={"/"} className="btn-primary btn flex-1">
                play again
              </Link>
              <a
                type="button"
                target="_blank"
                href={`https://twitter.com/intent/tweet?text=${encodeURI(
                  `I just got ${score} points in TweetGuesser 🥳

Guessing tweets from ${
                    usernames
                      ? usernames.map((username) => `@${username}`).join(" ")
                      : ""
                  }

`
                )}&url=https://www.tweetguesser.com&via=tweetguesser&hashtags=tweetguesser,tweetguessr`}
                className="btn-secondary btn-outline btn-square btn"
                rel="noreferrer"
              >
                <Twitter className="h-6 w-6" />
              </a>
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
            <Heart className="inline" /> built by{" "}
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
        <div className="flex grow flex-col justify-center">
          {!endless && !!handlesModeData?.tweets.length && (
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
                referencedTweet={currentTweet.referenced_tweet_id}
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
                usernames={usernames || []}
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
            {gameMode !== "tweets" && (
              <button
                type="button"
                disabled={!currentTweet}
                className={clsx(
                  "btn-square btn mr-2",
                  currentTweet &&
                    tweetIds.includes(currentTweet.id) &&
                    "btn-secondary"
                )}
                onClick={handleStarClick}
              >
                <Star
                  className={clsx(
                    currentTweet &&
                      tweetIds.includes(currentTweet.id) &&
                      "fill-secondary-content"
                  )}
                />
              </button>
            )}
            <button
              type="button"
              className="btn-error btn btn-outline"
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
            <div>
              <kbd className="kbd kbd-sm">Tab</kbd>
              <span> cycle suggestions</span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Game;
