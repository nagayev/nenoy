import Head from "next/head";
import React, { useEffect, useState } from "react";

const Error404Page = () => {
  let level;
  const scroll = function (e) {
    e.preventDefault();
    if (e.keyCode !== 40) {
      return;
    }
    console.log("Scroll " + level);
    level += 5;
    if (level === 30) {
      alert("Ты нашел пасхалку. Поздравляю!");
    } else if (level === 50) {
      alert("Эй, ты куда?");
    } else if (level === 75) {
      alert("Там внизу ничего нет");
    } else if (level === 100) {
      alert(
        "Конец! За настойчивость ты получаешь ачивку Кладоискатель себе в профиль",
      );
    }
  };
  useEffect(() => {
    level = 0;
    document.addEventListener("keydown", scroll);
  }, []);
  return (
    <body id="p404">
      <Head>
        <title>Неной | Не найдено</title>
      </Head>

      <h1>404</h1>
      <h1 id="notfound">Не найдено</h1>
    </body>
  );
};

export default Error404Page;
