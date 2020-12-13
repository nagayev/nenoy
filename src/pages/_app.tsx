import "../ui/index.css";
import "../ui/404.css";
import "../ui/PageContentsForIndex.css";
//import "react-mde/lib/styles/css/react-mde-all.css";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
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
