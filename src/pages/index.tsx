import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { api } from "../utils/api";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const router = useRouter();
  const [animationParent] = useAutoAnimate();
  const [usernames, setUsernames] = useState<string>();
  const usernamesArr = usernames?.split("\n");

  const {
    data: tweets,
    error,
    refetch,
  } = api.twitter.getTweets.useQuery(usernamesArr ?? [], {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled: false,
  });

  if (tweets) {
    void router.push({ pathname: "/game", query: { usernames: usernamesArr } });
  }

  const handlePlay = () => {
    void refetch();
  };

  return (
    <>
      <Head>
        <title>Twitter Guessr</title>
        <meta name="description" content="Twitter Guessr" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content flex-col">
          <div className="card w-96 flex-shrink-0 bg-base-100 shadow-xl">
            <div className="card-body" ref={animationParent}>
              <h1 className="card-title uppercase">Twitter Guesser</h1>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Twitter usernames</span>
                  <span className="label-text-alt">Separated by new line</span>
                </label>
                <textarea
                  value={usernames}
                  onChange={(event) => {
                    setUsernames(event.target.value);
                  }}
                  className="textarea-bordered textarea-primary textarea h-44 uppercase"
                  placeholder={`imShooTeX
roxcodes`}
                ></textarea>
              </div>
              {error && (
                <span className="text-sm text-error">
                  Something didn&apos;t work. Please check if the usernames are
                  correct or try again later.
                </span>
              )}
              <div className="form-control mt-6">
                <button
                  className="btn-primary btn"
                  disabled={!usernames}
                  onClick={handlePlay}
                >
                  Play
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
