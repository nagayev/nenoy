const dateDiff = require("date-diff-js");
import { getDateWithCase, saveFirstWords } from "./utils";
import React from "react";
import Viewer from "./Viewer";
import { PostModal } from "./PostModal";

interface PostProps {
  data: PostData;
}
interface PostData {
  id: number;
  header: string;
  content: string;
  checked: number;
  createdAt: number;
  updatedAt: number;
  type: number;
}

function formatDate(ms: number): string {
  //FIXME: dirty code
  //1,2,5
  const translations = {
    days: ["день", "дня", "дней"],
    hours: ["час", "часа", "часов"],
    milliseconds: ["миллисекунда", "миллисекунды", "миллисекунд"],
    minutes: ["минута", "минуты", "минут"],
    months: ["месяц", "месяца", "месяцев"],
    seconds: ["секунда", "секунды", "секунд"],
    weeks: ["неделя", "недели", "недель"],
    years: ["год", "года", "лет"],
  };
  const today = +new Date();
  const diff = dateDiff(today, ms).totals;
  const keys = Object.keys(diff);
  let minValue = Number.MAX_SAFE_INTEGER;
  let minKey = "";
  for (let i = 0; i < keys.length; i++) {
    let x = diff[keys[i]];
    if (x < minValue && x !== 0) {
      minValue = x;
      minKey = keys[i];
    }
  }
  const dateDiffWithCase = getDateWithCase(minValue, translations[minKey]);
  return `примерно ${minValue} ${dateDiffWithCase} назад`;
}

function getDate(createdAtDate, updatedAtDate = "") {
  if (updatedAtDate === "") {
    return <em>Написано: {createdAtDate}</em>;
  }
  return (
    <>
      <em>Написано: {createdAtDate}</em> <br />
      <em>Обновлено: {updatedAtDate}</em>
    </>
  );
}
export const Post: React.FunctionComponent<PostProps> = ({ data }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const createdAt = data.createdAt;
  const updatedAt = data.updatedAt;
  let date = <em></em>;
  const createdAtDate = formatDate(createdAt);
  const updatedAtDate = formatDate(updatedAt);
  //если дата создания = дате обновления, то отображаем 1 дату
  if (createdAt === updatedAt) {
    date = getDate(createdAtDate);
  } else {
    date = getDate(createdAtDate, updatedAtDate);
  }
  //NOTE: we have content, if content > 300 symbols (~50 words we can trim it(save the first 50 words))
  let trimedContent = data.content;
  const LETTERS_PER_WORD = 6;
  if (data.content.length > LETTERS_PER_WORD * 50)
    trimedContent = saveFirstWords(data.content);
  return (
    <>
      <PostModal isOpen={isOpen} setIsOpen={setIsOpen} data={data} />
      <div onClick={() => setIsOpen(true)}>
        <h2>{data.header}</h2>
        <p>{date}</p>
        <Viewer source={trimedContent} />
      </div>
    </>
  );
};
