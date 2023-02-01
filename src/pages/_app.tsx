import { type AppType } from "next/app";

import { api } from "../utils/api";

import "../styles/globals.css";
import { Provider } from "jotai";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <Provider>
      <Component {...pageProps} />
    </Provider>
  );
};

export default api.withTRPC(MyApp);
