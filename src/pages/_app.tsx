import { type AppType } from "next/app";

import { api } from "../utils/api";

import "../styles/globals.css";
import { Provider } from "jotai";
import { Analytics } from "@vercel/analytics/react";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <Provider>
      <Component {...pageProps} />
      <Analytics />
    </Provider>
  );
};

export default api.withTRPC(MyApp);
