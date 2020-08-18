import Head from "next/head";
import React from "react";

import PageContentsForIndex from "../ui/PageContentsForIndex";

const IndexPage = () => {
  return (
    <>
      <Head>
        <title>Неной</title>
      </Head>
      <PageContentsForIndex />
    </>
  );
};

export default IndexPage;
