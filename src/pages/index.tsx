import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { api } from "../utils/api";
import { useRouter } from "next/router";
import { Logo } from "../components/Logo";
import { FaHeart } from "react-icons/fa";
import { UsernamesInput } from "../components/UsernamesInput";
import { XCircle } from "lucide-react";
import { useAutoAnimate } from "@formkit/auto-animate/react";

const Home: NextPage = () => {
  const router = useRouter();
  const [animationParent] = useAutoAnimate();

  const [usernames, setUsernames] = useState<string[]>([]);
  const [invalidUsernames, setInvalidUsernames] = useState<string[]>([]);

  // Remove vvv
  const [endlessMode, setEndlessMode] = useState(false);
  // ---

  const {
    data: tweets,
    error,
    isFetching,
    refetch,
  } = api.twitter.getTweets.useQuery(usernames ?? [], {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    cacheTime: 0,
    retry: false,
    enabled: false,
  });

  if (!!tweets?.invalidUsernames?.length && tweets?.data) {
    void router.push({
      pathname: "/game",
      query: { usernames, endlessMode },
    });
  }

  if (!!tweets?.invalidUsernames?.length) {
    const newInvalidUsernames = tweets.invalidUsernames.filter(
      (username) => !invalidUsernames.includes(username)
    );

    if (!!newInvalidUsernames.length) {
      setInvalidUsernames((usernames) => [
        ...usernames,
        ...newInvalidUsernames,
      ]);
    }
  }

  const usernamesAreValid = usernames.every(
    (username) => !invalidUsernames.includes(username)
  );

  console.log(usernamesAreValid);

  const handlePlay = () => {
    void refetch();
  };

  const handleUsernamesInput = (input: string) => {
    if (usernames.includes(input)) {
      return;
    }

    setUsernames((usernames) => [...usernames, input]);
  };

  const handleUsernameClick = (input: string) => {
    setUsernames((usernames) =>
      usernames.filter((username) => username !== input)
    );
  };

  return (
    <>
      <Head>
        <title>TWEETGUESSER</title>
        <meta name="description" content="He tweeted what?!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content flex-col">
          <Logo />
          <div className="card w-96 flex-shrink-0 bg-base-100 shadow-xl">
            <div className="card-body" ref={animationParent}>
              <UsernamesInput
                onSubmit={({ handle }) => {
                  handleUsernamesInput(handle);
                }}
              />
              {!!usernames?.length && (
                <div
                  className="flex flex-wrap gap-x-1 gap-y-1"
                  ref={animationParent}
                >
                  {usernames.map((username) => (
                    <div
                      className={`badge cursor-pointer ${
                        invalidUsernames.includes(username) ? "badge-error" : ""
                      }`}
                      key={username}
                      onClick={() => handleUsernameClick(username)}
                    >
                      {username}
                    </div>
                  ))}
                </div>
              )}
              {!!error ||
                (!usernamesAreValid && (
                  <div className="alert alert-error mt-4 shadow-lg">
                    <div>
                      <XCircle></XCircle>
                      <span>
                        {!!error
                          ? "An unknown error occured"
                          : "One or more usernames are invalid"}
                      </span>
                    </div>
                  </div>
                ))}
              <div className="divider">Settings</div>
              <div className="form-control w-52">
                <label className="label cursor-pointer">
                  <span className="label-text">Endless Mode</span>
                  <input
                    type="checkbox"
                    className="toggle-primary toggle"
                    checked={endlessMode}
                    onChange={(event) => {
                      setEndlessMode(event.target.checked);
                    }}
                  />
                </label>
              </div>
              <div className="form-control mt-6">
                <button
                  className={`btn-primary btn ${
                    isFetching || !!tweets?.data ? "loading" : ""
                  }`}
                  disabled={
                    !usernames ||
                    usernames.length < 2 ||
                    !usernamesAreValid ||
                    isFetching ||
                    !!tweets?.data
                  }
                  onClick={handlePlay}
                >
                  Play
                </button>
              </div>
            </div>
          </div>
          <span className="text-sm">
            <FaHeart className="inline" /> build by{" "}
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
