import { NextPage } from "next";
import React, { useState } from "react";
import Posts from "./Posts";
//import gismap from "./2gismap"
import MapProvider from "./Map";
import dark from "./dark";
import logo from "./logo.jpg";
import Menu from "./Menu";

const PageContentsForIndex: NextPage = () => {
  const style = dark;
  const [postType,setType] = useState(0);
  return (
    <div style={style.pageLayout}>
      <div style={style.languages}>
        <a style={style.dots} href="#">
          en
        </a>{" "}
        <a style={style.dots} href="#">
          ru
        </a>
      </div>
      <h1>Неной</h1>
      <img id="me" src={logo} alt="Украина не Россия" style={style.me} />
      <div id="menu">
        <Menu updateState={setType} />
      </div>
      <div id="map">
      &nbsp;
      <MapProvider />
      </div>
      <p>Версия тестовая, буду обновлять</p>
      <Posts  postType={postType} />
      <br />
      <div id="bottom">
        nenoy.ru, 2020 <br />
        Made by {" "}
        <a style={style.a} href="https://nagayev.ru">
        nagayev.ru
        </a><br />
        Source code are available{" "}
        <a style={style.a} href="https://github.com/nagayev/nenoy">
          here
        </a>
      </div>
    </div>
  );
};

export default PageContentsForIndex;
