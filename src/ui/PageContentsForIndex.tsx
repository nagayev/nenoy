import { NextPage } from "next";
import React, { useState } from "react";
import dynamic from "next/dynamic";

import logo from "./logo.jpg";
import MapProvider from "./Map";
import NoSSR from "./no";
import Menu from "./Menu";
import Posts from "./Posts";
import TopMenu from "./TopMenu";
import { getDefaultTheme } from "./utils";
import { headers } from "./objectTypes";

function PostsWrapper(props) {
  const { posts, setPosts } = props;
  const [isPortrait, setIsPortrait] = React.useState(true);
  React.useEffect(() => {
    console.log("Update orientation");
    setIsPortrait(screen.availHeight > screen.availWidth);
  }, [screen.availWidth, screen.availHeight]);
  return (
    <div style={{ display: isPortrait ? "inline-block" : "inline-flex" }}>
      <div id="map">
        <MapProvider posts={posts} setPosts={setPosts} />
      </div>
      <div>
        <Posts posts={posts} setPosts={setPosts} postType={props.postType} />
      </div>
    </div>
  );
}
const PageContentsForIndex: NextPage = () => {
  const style = getDefaultTheme();
  const [postType, setType] = useState(0);
  const [posts, setPosts] = useState([]);
  return (
    <div style={style.pageLayout}>
      <TopMenu />
      <h1>Неной</h1>
      {/*<img id="me" src={logo} alt="Неной" style={style.me} /> */}
      <div id="menu">
        <Menu updateState={setType} />
      </div>
      <h1>{headers[postType]}</h1>
      <NoSSR>
        <PostsWrapper posts={posts} setPosts={setPosts} postType={postType} />
      </NoSSR>
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
