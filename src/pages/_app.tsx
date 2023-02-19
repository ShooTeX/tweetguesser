import { type AppType } from "next/app";

import { api } from "../utils/api";

import "../styles/globals.css";
import { Provider } from "jotai";
import { Analytics } from "@vercel/analytics/react";
import Head from "next/head";
import { Inter, Noto_Sans_Mono } from "@next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const notoSansMono = Noto_Sans_Mono({ subsets: ["latin"], display: "swap" });

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <style jsx global>
        {`
          :root {
            --inter-font: ${inter.style.fontFamily};
            --noto-sans-mono-font: ${notoSansMono.style.fontFamily};
          }
        `}
      </style>
      <Head>
        <title>TWEETGUESSER</title>
        <meta name="description" content="Test your twitter skills!" />
        <meta property="og:type" content="website" />
        <meta property="og:description" content="Test your twitter skills!" />
        <meta property="og:title" content="TWEETGUESSER" />
        <meta property="og:url" content="https://www.tweetguesser.com" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="TWEETGUESSER" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="tweetguesser.com" />
        <meta property="twitter:url" content="https://www.tweetguesser.com" />
        <meta name="twitter:title" content="TWEETGUESSER" />
        <meta name="twitter:description" content="Test your twitter skills!" />

        {process.env.VERCEL_URL && (
          <>
            <meta
              name="twitter:image"
              content={`https://${process.env.VERCEL_URL}/images/og-image.jpeg`}
            />
            <meta
              property="og:image"
              content={`https://${process.env.VERCEL_URL}/images/og-image.jpeg`}
            />
          </>
        )}
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
