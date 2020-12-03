import { NextPage } from "next";
import React, { useState } from "react";

import logo from "./logo.jpg";
import MapProvider from "./Map_exp";
import Menu from "./Menu";
import Posts from "./Posts";
import TopMenu from "./TopMenu";
import { getDefaultTheme } from "./utils";
import { headers } from "./objectTypes";

const PageContentsForIndex: NextPage = () => {
  const style = getDefaultTheme();
  const [postType, setType] = useState(0);
  const [posts, setPosts] = useState([]);
  return (
    <div style={style.pageLayout}>
      <TopMenu />
      <h1>Неной</h1>
      <img id="me" src={logo} alt="Неной" style={style.me} />
      <div id="menu">
        <Menu updateState={setType} />
      </div>
      <div id="map">
        &nbsp;
        <MapProvider posts={posts} setPosts={setPosts} />
      </div>
      <h1>{headers[postType]}</h1>
      <Posts posts={posts} setPosts={setPosts} postType={postType} />
      <br />
      <div id="bottom">
        nenoy.ru, 2020 <br />
        Made by{" "}
        <a style={style.a} href="https://nagayev.ru">
          nagayev.ru
        </a>
        <br />
        Source code are available{" "}
        <a style={style.a} href="https://github.com/nagayev/unr">
          here
        </a>
      </div>
    </div>
  );
};

export default PageContentsForIndex;
