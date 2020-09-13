import { NextPage } from "next";
import React, { useState } from "react";

import logo from "./logo.jpg";
import MapProvider from "./Map";
import Menu from "./Menu";
import Posts from "./Posts";
import TopMenu from "./TopMenu";
import { getDefaultTheme } from "./utils";

const PageContentsForIndex: NextPage = () => {
  const style = getDefaultTheme();
  const [postType, setType] = useState(0);
  const headers = ["Блог редакции", "Больницы", "Заводы"];
  return (
    <div style={style.pageLayout}>
      <TopMenu />
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
      <h1>{headers[postType]}</h1>
      <Posts postType={postType} />
      <br />
      <div id="bottom">
        nenoy.ru, 2020 <br />
        Made by{" "}
        <a style={style.a} href="https://nagayev.ru">
          nagayev.ru
        </a>
        <br />
        Source code are available{" "}
        <a style={style.a} href="https://github.com/nagayev/nenoy">
          here
        </a>
      </div>
    </div>
  );
};

export default PageContentsForIndex;
