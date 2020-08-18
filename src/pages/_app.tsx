//import "react-awesome-slider/dist/styles.css";
import "../ui/index.css";
import "../ui/PageContentsForIndex.css";
// https://github.com/roylee0704/react-flexbox-grid/issues/173#issuecomment-628984004
//import "react-flexbox-grid/dist/react-flexbox-grid.css";

import { AppProps } from "next/app";
import Head from "next/head";
import React from "react";

const App: React.FunctionComponent<AppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <link rel="apple-touch-icon" href="/logo192.png" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </>
  );
};

export default App;
