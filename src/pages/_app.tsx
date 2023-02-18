import { type AppType } from "next/app";

import { api } from "../utils/api";

import "../styles/globals.css";
import { Provider } from "jotai";
import { Analytics } from "@vercel/analytics/react";
import Head from "next/head";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>TWEETGUESSER</title>
        <meta name="description" content="Test your twitter skills!" />
        <meta property="og:type" content="website" />
        <meta property="og:description" content="Test your twitter skills!" />
        <meta property="og:title" content="TWEETGUESSER" />
        <meta property="og:url" content="https://www.tweetguesser.com" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="TWEETGUESSER" />
        <meta property="og:image" content="/images/og-image.jpeg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="tweetguesser.com" />
        <meta property="twitter:url" content="https://www.tweetguesser.com" />
        <meta name="twitter:title" content="TWEETGUESSER" />
        <meta name="twitter:description" content="Test your twitter skills!" />
        <meta name="twitter:image" content="/images/og-image.jpeg" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Provider>
        <Component {...pageProps} />
        <Analytics />
      </Provider>
    </>
  );
};

export default api.withTRPC(MyApp);
