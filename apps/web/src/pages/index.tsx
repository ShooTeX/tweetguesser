import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { AlertCircle, Heart, List, ListPlus, Menu, Users } from "lucide-react";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import {
  gameConfigAtom,
  gameModeSchema,
  tweetIdsAtom,
  usernamesAtom,
} from "../atoms/game";
import { AddFromFollowingModal } from "../components/add-from-following";
import { AddFromListModal } from "../components/add-from-list";
import { HandleInput } from "../components/handle-input";
import { HandleList } from "../components/handle-list";
import { Logo } from "../components/logo";
import { Modal } from "../components/modal";
import { api } from "../utils/api";
import { getEndTime } from "../utils/get-end-time";
import { Settings } from "../components/settings";
import useMeasure from "react-use-measure";
import {
  addEmptyUsernamesCacheAtom,
  addForbiddenUsernamesCacheAtom,
  currentEmptyUsernamesAtom,
  currentForbiddenUsernamesAtom,
} from "../atoms/invalid-usernames";
import { TweetsLists } from "../components/tweets-lists";
import { tweetsListsAtom } from "../atoms/tweets-lists";

const HandleTab = () => {
  const router = useRouter();
  const { endTime } = useAtomValue(gameConfigAtom);
  const addForbiddenUsernames = useSetAtom(addForbiddenUsernamesCacheAtom);
  const addEmptyUsernames = useSetAtom(addEmptyUsernamesCacheAtom);
  const forbiddenUsernames = useAtomValue(currentForbiddenUsernamesAtom);
  const emptyUsernames = useAtomValue(currentEmptyUsernamesAtom);
  const [usernames, updateUsernames] = useAtom(usernamesAtom);
  const [isFromFollowingOpen, setIsFromFollowingOpen] = useState(false);
  const [isFromListOpen, setIsFromListOpen] = useState(false);
  const [listId, setListId] = useState<string>();
  const [bottomReference, { height: bottomHeight }] = useMeasure();

  const { data, isFetching, refetch } =
    api.twitter.getTweetsByUsernames.useQuery(
      { usernames: usernames, endTime: getEndTime(endTime) },
      {
        enabled: false,
        select: (data) => {
          const forbidden = data.invalidUsers
            ?.filter((user) => user.reason === "forbidden")
            .map((user) => user.handle.toLowerCase());

          const empty = data.invalidUsers
            ?.filter((user) => user.reason === "empty")
            .map((user) => user.handle.toLowerCase());

          return { forbidden, empty, tweets: data.tweets };
        },
      }
    );

  const { isFetching: isListFetching } = api.twitter.getListMembers.useQuery(
    { id: listId || "" },
    {
      enabled: !!listId,
      onSuccess: (data) => {
        updateUsernames(data);
        setListId(undefined);
      },
      onError: () => {
        setListId(undefined);
      },
    }
  );

  const getListMembers = (id: string) => {
    setListId(id);
  };

  const handlePlay = async () => {
    if (data && !data.forbidden?.length && !data.empty?.length) {
      void router.push("/game");
    }

    const { data: refetchData } = await refetch();

    if (refetchData?.forbidden?.length) {
      addForbiddenUsernames(refetchData.forbidden);
      return;
    }
    if (refetchData?.empty?.length) {
      addEmptyUsernames(refetchData.empty);
      return;
    }
    void router.push("/game");
  };

  return (
    <>
      <Modal show={isFromFollowingOpen}>
        <AddFromFollowingModal
          onSuccess={() => setIsFromFollowingOpen(false)}
          onBackdropClick={() => setIsFromFollowingOpen(false)}
        />
      </Modal>
      <Modal show={isFromListOpen}>
        <AddFromListModal
          onSuccess={() => setIsFromListOpen(false)}
          onBackdropClick={() => setIsFromListOpen(false)}
        />
      </Modal>
      <div>
        <div className="flex">
          <HandleInput disabled={isListFetching} />
          <div className="dropdown dropdown-right">
            <label tabIndex={0} className="btn btn-square ml-1">
              <Menu />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-300 rounded-box w-52 p-2 shadow"
            >
              <li className="px-2 text-sm">Add from...</li>
              <div className="divider m-0" />
              <li>
                <a onClick={() => setIsFromFollowingOpen(true)}>
                  <Users className="shrink-0" />
                  Following
                </a>
              </li>
              <li>
                <a onClick={() => setIsFromListOpen(true)}>
                  <List className="shrink-0" />
                  List
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-4">
          <HandleList />
        </div>
        <AnimatePresence>
          {forbiddenUsernames.length > 0 && (
            <motion.div
              className="flex overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="alert alert-error mt-4 text-sm">
                <AlertCircle className="shrink-0" />
                <span>
                  One or more handles were invalid, please remove them and retry
                </span>
              </div>
            </motion.div>
          )}
          {emptyUsernames.length > 0 && (
            <motion.div
              className="flex overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="alert alert-warning mt-4 text-sm">
                <AlertCircle className="shrink-0" />
                <span>
                  One or more usernames don&apos;t have tweets. Try tweaking the
                  settings or remove the username(s)
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          animate={{
            height: bottomHeight,
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={usernames.length === 0 ? "list" : "settings"}
              ref={bottomReference}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: "just" }}
            >
              {usernames.length === 0 ? (
                <>
                  <div className="divider">Try a list</div>
                  <div
                    className="card card-compact bg-neutral cursor-pointer"
                    onClick={() => getListMembers("1629851852270448645")}
                  >
                    <div className="card-body gap-0">
                      <h2 className="card-title">TechNerds</h2>
                      <p>Just a bunch of nerds...</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="divider">Settings</div>
                  <Settings />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
      <div className="form-control mt-6">
        <button
          className={clsx(["btn-primary btn-lg btn", isFetching && "loading"])}
          disabled={
            !usernames ||
            usernames.length < 2 ||
            isFetching ||
            emptyUsernames.length > 0 ||
            forbiddenUsernames.length > 0
          }
          onClick={handlePlay}
        >
          Play
        </button>
      </div>
    </>
  );
};

const TweetsTab = () => {
  const router = useRouter();
  const [tweetIds, setTweetIds] = useAtom(tweetIdsAtom);
  const tweetsLists = useAtomValue(tweetsListsAtom);

  const { data, isFetching, isError, refetch } = api.twitter.getTweets.useQuery(
    { ids: tweetIds || [] },
    { enabled: false }
  );

  const handlePlay = async () => {
    if (data?.tweets.length) {
      void router.push("/game");
    }

    const { data: refetchData, isError } = await refetch();

    if (isError || !refetchData?.tweets.length) {
      return;
    }
    void router.push("/game");
  };

  return (
    <>
      <div className="form-control">
        <textarea
          rows={7}
          className="textarea textarea-primary"
          value={tweetIds.join("\n")}
          onChange={(event) =>
            setTweetIds(
              event.target.value.split("\n").map((value) => value.trim())
            )
          }
        />
        <label className="label">
          <span className="label-text-alt">
            Tweet ids seperated by linebreak
          </span>
        </label>
      </div>
      {tweetsLists.length > 0 && <TweetsLists />}
      <AnimatePresence>
        {isError && (
          <motion.div
            className="flex overflow-hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="alert alert-error mt-4 justify-start text-sm">
              <AlertCircle className="shrink-0" />
              <span>Something went wrong :(</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 flex items-center gap-2">
        <button
          className={clsx([
            "btn-primary btn-lg btn flex-1",
            isFetching && "loading",
          ])}
          disabled={isError || isFetching || tweetIds.length < 2}
          onClick={handlePlay}
        >
          Play
        </button>
        <button
          className="btn-square btn btn-lg"
          disabled={isError || isFetching || tweetIds.length < 2}
        >
          <ListPlus />
        </button>
      </div>
    </>
  );
};

const Home: NextPage = () => {
  const { gameMode } = useAtomValue(gameConfigAtom);
  const setGameConfig = useSetAtom(gameConfigAtom);

  return (
    <>
      <div className="hero bg-base-200 min-h-screen">
        <div className="hero-content flex-col gap-0">
          <Logo />
          <div className="tabs mt-4 w-full capitalize">
            {gameModeSchema.options.map((mode) => (
              <a
                className={clsx(
                  "tab tab-lifted tab-border-none",
                  mode === gameMode && "tab-active"
                )}
                key={mode}
                onClick={() =>
                  setGameConfig((config) => ({ ...config, gameMode: mode }))
                }
              >
                {mode}
                {mode === "tweets" && (
                  <span className="badge badge-sm ml-1">beta</span>
                )}
              </a>
            ))}
          </div>
          <div
            className={clsx(
              "card bg-base-100 w-[425px] shrink-0 shadow-xl",
              gameModeSchema.options[0] === gameMode && "rounded-tl-none"
            )}
          >
            <div className="card-body">
              {gameMode === "handles" && <HandleTab />}
              {gameMode === "tweets" && <TweetsTab />}
            </div>
          </div>
          <span className="mt-4 text-sm">
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
      </div>
    </>
  );
};

export default Home;
