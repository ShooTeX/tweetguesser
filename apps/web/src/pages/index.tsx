import { type NextPage } from "next";
import { useState } from "react";
import { api } from "../utils/api";
import { useRouter } from "next/router";
import { Logo } from "../components/logo";
import {
  AlertCircle,
  AtSign,
  Heart,
  List,
  Loader2,
  Menu,
  Users,
  XCircle,
} from "lucide-react";
import {
  addInvalidUsernamesAtom,
  gameConfigAtom,
  gameModeSchema,
  invalidUsernamesAtom,
  tweetIdsAtom,
  usernamesAtom,
} from "../atoms/game";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { getEndTime } from "../utils/get-end-time";
import clsx from "clsx";
import type { InvalidUser } from "../server/api/routers/twitter/procedures/get-tweets-by-username";
import { basicHandleSchema, HandleInput } from "../components/handle-input";
import { HandleList } from "../components/handle-list";
import { AnimatePresence, motion } from "framer-motion";
import { Modal } from "../components/modal";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const addFromFollowingSchema = z.object({
  handle: basicHandleSchema,
});

type AddFromFollowingData = z.infer<typeof addFromFollowingSchema>;

const AddFromFollowingModal = ({
  onSuccess,
  onBackdropClick,
}: {
  onSuccess: () => void;
  onBackdropClick: () => void;
}) => {
  const updateUsernames = useSetAtom(usernamesAtom);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AddFromFollowingData>({
    resolver: zodResolver(addFromFollowingSchema),
    mode: "onSubmit",
    delayError: 100,
    shouldUnregister: true,
  });
  const username = watch("handle");
  const {
    refetch: fetch,
    isFetching,
    isError,
  } = api.twitter.getRandomFollowing.useQuery(
    { username },
    {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      enabled: false,
      onSuccess: (data) => {
        if (data.length === 0) {
          return;
        }

        updateUsernames(data);
        onSuccess();
      },
    }
  );

  const onSubmit = (data: AddFromFollowingData) => {
    if (!data.handle) {
      return;
    }
    void fetch();
  };

  return (
    <div className="modal modal-open modal-bottom sm:modal-middle">
      <div
        className="absolute inset-0 backdrop-blur"
        onClick={onBackdropClick}
      ></div>
      <div className="modal-box">
        <div className="flex gap-2">
          <Users />
          <h3 className="text-lg font-bold">Add from following</h3>
        </div>
        <form
          className="form-control w-full py-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className={clsx("relative", errors.handle && "animate-wiggle")}>
            <label className="input-group">
              <span>
                <AtSign size={16} />
              </span>
              <input
                autoComplete="off"
                disabled={isFetching}
                type="text"
                autoFocus
                className="input-bordered input-primary input flex-1 shrink-0"
                {...register("handle")}
              />
            </label>
            <AnimatePresence initial={false}>
              <motion.div
                key={isFetching ? "fetching" : isError ? "error" : "kbd"}
                className="absolute inset-y-0 right-4 flex flex-col justify-center"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ type: "spring" }}
              >
                {isFetching ? (
                  <Loader2 className="text-secondary shrink-0 animate-spin" />
                ) : isError ? (
                  <XCircle className="text-error shrink-0" />
                ) : (
                  <kbd className="kbd">⏎</kbd>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {errors.handle && (
              <motion.div
                initial={{
                  y: -20,
                  height: 0,
                  opacity: 0,
                }}
                animate={{
                  y: 0,
                  height: "auto",
                  opacity: 1,
                }}
                exit={{
                  y: -10,
                  height: 0,
                  opacity: 0,
                }}
              >
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.handle.message}
                  </span>
                </label>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
};

const HandleTab = () => {
  const invalidUsernames = useAtomValue(invalidUsernamesAtom);
  const [isFromFollowingOpen, setIsFromFollowingOpen] = useState(false);

  return (
    <>
      <Modal show={isFromFollowingOpen}>
        <AddFromFollowingModal
          onSuccess={() => setIsFromFollowingOpen(false)}
          onBackdropClick={() => setIsFromFollowingOpen(false)}
        />
      </Modal>
      <div>
        <div className="flex">
          <HandleInput />
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
                <a>
                  <List className="shrink-0" />
                  List
                </a>
              </li>
            </ul>
          </div>
        </div>
        <HandleList className="mt-4" />
        <AnimatePresence>
          {invalidUsernames.length > 0 && (
            <motion.div
              className="flex overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <motion.div className="alert alert-error mt-4">
                <AlertCircle className="shrink-0" />
                <span>
                  One or more handles were invalid, please remove them and retry
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

const Home: NextPage = () => {
  const router = useRouter();
  const { endTime, gameMode } = useAtomValue(gameConfigAtom);
  const usernames = useAtomValue(usernamesAtom);
  const addInvalidUsernames = useSetAtom(addInvalidUsernamesAtom);
  const setGameConfig = useSetAtom(gameConfigAtom);

  const [tweetIds, setTweetIds] = useAtom(tweetIdsAtom);
  const [invalidUsernames, setInvalidUsers] = useState<InvalidUser[]>([]);

  const { data, isFetching, refetch } =
    api.twitter.getTweetsByUsernames.useQuery(
      { usernames: usernames, endTime: getEndTime(endTime) },
      {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        enabled: false,
        onSuccess: (data) => {
          if (data?.invalidUsers?.length) {
            addInvalidUsernames(data.invalidUsers.map((user) => user.handle));
          }
        },
      }
    );

  // const {
  //   isFetching: getSpecifiedTweetsFetching,
  //   refetch: fetchSpecifiedTweets,
  //   error: getSpecifiedTweetsError,
  // } = api.twitter.getTweets.useQuery(
  //   { ids: tweetIds },
  //   {
  //     retry: false,
  //     refetchOnWindowFocus: false,
  //     refetchOnMount: false,
  //     enabled: false,
  //   }
  // );

  const usernamesAreValid = usernames.every(
    (username) =>
      !invalidUsernames.some(({ handle }) => handle.toLowerCase() === username)
  );

  const handlePlay = async () => {
    if (gameMode === "handles") {
      if (!data?.invalidUsers?.length && data?.tweets.length) {
        void router.push("/game");
      }

      const { data: refetchData } = await refetch();

      if (!refetchData?.invalidUsers?.length && refetchData?.tweets.length) {
        void router.push("/game");
      }
    }
    // if (gameMode === "tweets") {
    //   const { data } = await fetchSpecifiedTweets();
    //
    //   if (data?.tweets && data.tweets.length > 0) {
    //     void router.push("/game");
    //   }
    // }
  };

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
              {gameMode === "tweets" && (
                <>
                  <div className="form-control">
                    <textarea
                      className="textarea textarea-primary"
                      value={tweetIds.join("\n")}
                      onChange={(event) =>
                        setTweetIds(
                          event.target.value
                            .split("\n")
                            .map((value) => value.trim())
                        )
                      }
                    />
                    <label className="label">
                      <span className="label-text-alt">
                        Tweet ids seperated by linebreak
                      </span>
                    </label>
                  </div>
                  {/* {getSpecifiedTweetsError && ( */}
                  {/*   <div className="alert alert-error mt-4 shadow-lg"> */}
                  {/*     <div> */}
                  {/*       <XCircle></XCircle> */}
                  {/*       <span>Something went wrong :(</span> */}
                  {/*     </div> */}
                  {/*   </div> */}
                  {/* )} */}
                </>
              )}
              <div className="form-control mt-6">
                <button
                  className={clsx([
                    "btn-primary btn-lg btn",
                    isFetching && "loading",
                  ])}
                  disabled={
                    gameMode === "handles" &&
                    (!usernames ||
                      usernames.length < 2 ||
                      !usernamesAreValid ||
                      isFetching)
                  }
                  onClick={handlePlay}
                >
                  Play
                </button>
              </div>
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
