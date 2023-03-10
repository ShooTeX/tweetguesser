import { type NextPage } from "next";
import { useState } from "react";
import { api } from "../utils/api";
import { useRouter } from "next/router";
import { Logo } from "../components/logo";
import type { UsernamesInputData } from "../components/usernames-input";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  gameConfigAtom,
  gameModeSchema,
  tweetIdsAtom,
  usernamesAtom,
} from "../atoms/game";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { getEndTime } from "../utils/get-end-time";
import { clamp, equals } from "remeda";
import arrayShuffle from "array-shuffle";
import type { InvalidUser } from "../server/api/routers/twitter/procedures/get-tweets-by-username";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "../components/ui/dropdown-menu";
import { AtSign, ChevronsUpDown, Heart, List, Menu, Users } from "lucide-react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { Collapsible, CollapsibleTrigger } from "../components/ui/collapsible";

const Home: NextPage = () => {
  const router = useRouter();
  const [animationParent] = useAutoAnimate();
  const { endTime, gameMode } = useAtomValue(gameConfigAtom);
  const setGameConfig = useSetAtom(gameConfigAtom);

  const [usernames, setUsernames] = useAtom(usernamesAtom);
  const [tweetIds, setTweetIds] = useAtom(tweetIdsAtom);
  const [getFollowing, setGetFollowing] = useState<string>();
  const [getListMembers, setGetListMembers] = useState<string>();
  const [invalidUsers, setInvalidUsers] = useState<InvalidUser[]>([]);

  const { data, error, isFetching, refetch } =
    api.twitter.getTweetsByUsernames.useQuery(
      { usernames: usernames, endTime: getEndTime(endTime) },
      {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        enabled: false,
      }
    );

  const { data: following, isFetching: isFollowingFetching } =
    api.twitter.getRandomFollowing.useQuery(
      { username: getFollowing || "" },
      {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        enabled: !!getFollowing,
      }
    );

  const { data: listMembers, isFetching: isListMembersFetching } =
    api.twitter.getListMembers.useQuery(
      { id: getListMembers || "" },
      {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        enabled: !!getListMembers,
      }
    );

  const {
    isFetching: getSpecifiedTweetsFetching,
    refetch: fetchSpecifiedTweets,
    error: getSpecifiedTweetsError,
  } = api.twitter.getTweets.useQuery(
    { ids: tweetIds },
    {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      enabled: false,
    }
  );

  if (getListMembers && listMembers?.length) {
    const truncListMembers = [...listMembers];
    truncListMembers.length = clamp(truncListMembers.length, { max: 20 });
    setGetListMembers(undefined);
    setUsernames(truncListMembers);
  }

  if (getFollowing && following?.length && !equals(usernames, following)) {
    const randomFollowing = [...arrayShuffle(following)];
    randomFollowing.length = clamp(randomFollowing.length, { max: 20 });
    setGetFollowing(undefined);
    setUsernames(randomFollowing);
  }

  if (data?.invalidUsers?.length) {
    const newInvalidUsers = data.invalidUsers.filter(
      (user) =>
        !invalidUsers.some((cachedUser) => user.handle === cachedUser.handle)
    );

    if (newInvalidUsers.length > 0) {
      setInvalidUsers((users) => [...users, ...newInvalidUsers]);
    }
  }

  const usernamesAreValid = usernames.every(
    (username) =>
      !invalidUsers.some(({ handle }) => handle.toLowerCase() === username)
  );

  const usernamesIncludeForbidden = usernames.some((username) =>
    invalidUsers.some(
      ({ handle, reason }) =>
        handle.toLowerCase() === username && reason === "forbidden"
    )
  );

  const usernamesIncludeEmpty = usernames.some((username) =>
    invalidUsers.some(
      ({ handle, reason }) =>
        handle.toLowerCase() === username && reason === "empty"
    )
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
    if (gameMode === "tweets") {
      const { data } = await fetchSpecifiedTweets();

      if (data?.tweets && data.tweets.length > 0) {
        void router.push("/game");
      }
    }
  };

  const handleUsernamesInput = ({ input, mode }: UsernamesInputData) => {
    if (mode === "following") {
      setGetFollowing(input);
      return;
    }

    if (mode === "list") {
      setGetListMembers(input);
      return;
    }

    if (usernames.includes(input.toLowerCase())) {
      return;
    }

    setUsernames((usernames) => [...usernames, input.toLowerCase()]);
  };

  const handleUsernameClick = (input: string) => {
    setUsernames((usernames) =>
      usernames.filter((username) => username !== input)
    );
  };

  const resetEmptyUsernames = () => {
    setInvalidUsers((users) => users.filter((user) => user.reason !== "empty"));
  };

  return (
    <>
      <div className="flex h-screen">
        <div className="m-auto flex flex-col gap-4">
          <Logo />
          <Tabs
            defaultValue={gameModeSchema.enum.handles}
            className="w-[425px]"
          >
            <TabsList>
              {gameModeSchema.options.map((mode) => (
                <TabsTrigger value={mode} key={mode} className="capitalize">
                  {mode}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={gameModeSchema.enum.handles}>
              <p className="text-sm text-slate-500 dark:text-slate-200">
                Choose the users whose tweets you want to guess
              </p>
              <Separator className="my-4" />
              <div className="flex w-full items-center space-x-2">
                <div className="flex w-full">
                  <div className="flex w-10 rounded-l-md bg-pink-700">
                    <AtSign className="m-auto h-4 w-4" />
                  </div>
                  <Input
                    type="email"
                    placeholder="Handle"
                    className="w-full rounded-l-none dark:border-pink-700"
                    autoFocus
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="w-10 shrink-0 rounded-full p-0 dark:bg-pink-700 dark:text-white dark:hover:bg-pink-900">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Fetch from ...</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Users className="mr-2 h-4 w-4" />
                      Following
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <List className="mr-2 h-4 w-4" />
                      List
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Collapsible className="mt-8 space-y-2">
                <div className="flex items-center justify-between space-x-4">
                  <h4 className="text-sm font-semibold">
                    Or try one of these lists
                  </h4>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-9 p-0">
                      <ChevronsUpDown className="h-4 w-4" />
                      <span className="sr-only">Toggle</span>
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <div className="cursor-pointer rounded-md border-pink-600 bg-gradient-to-br from-transparent to-pink-600 px-4 py-3 hover:to-pink-900">
                  <div className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                    Technerds
                  </div>
                  <p className="text-sm text-slate-500 dark:text-pink-200">
                    Just a bunch of nerds...
                  </p>
                </div>
              </Collapsible>
            </TabsContent>
            <TabsContent value={gameModeSchema.enum.tweets}>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Change your password here. After saving, you&apos;ll be logged
                out.
              </p>
            </TabsContent>
          </Tabs>
          <div className="flex flex-col items-center space-y-4">
            <Button
              size={"lg"}
              className="w-full font-bold uppercase dark:bg-pink-600 dark:text-white"
              onClick={handlePlay}
            >
              Play
            </Button>
            <span className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              <Heart className="inline" /> built by{" "}
              <a
                className="text-slate-900 underline-offset-4 hover:underline dark:text-slate-50"
                href="https://twitter.com/imshootex"
                target="_blank"
                rel="noreferrer"
              >
                @imShooTeX
              </a>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
