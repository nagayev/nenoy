const dateDiff =  require("date-diff-js");
import {getDateWithCase} from "./utils";
import React from "react";
import ReactMarkdown from "react-markdown";

interface PostProps {
  data: PostData;
}
interface PostData {
  id:number;
  header: string;
  content: string;
  checked:number;
  createdAt:string;
  updatedAt:string;
  type:number;
}

function formatDate(ms: number): string {
  //FIXME: dirty code
  //1,2,5
  const translations={
    days: ['день','дня','дней'],
    hours: ['час','часа','часов'], 
    milliseconds: ['миллисекунда','миллисекунды','миллисекунд'], 
    minutes: ['минута','минуты','минут'],
    months: ['месяц','месяца','месяцев'], 
    seconds: ['секунда','секунды','секунд'], 
    weeks: ['неделя','недели','недель'],
    years: ['год','года','лет']
  }
  const today = +new Date();
  const diff = dateDiff(today,ms).totals;
  const keys = Object.keys(diff);
  let minValue = Number.MAX_SAFE_INTEGER;
  let minKey = '';
  for(let i=0;i<keys.length;i++){
    let x = diff[keys[i]];
    if(x<minValue && x!==0){
      minValue=x;
      minKey=keys[i];
    }
  }
  const dateDiffWithCase = getDateWithCase(minValue,translations[minKey]);
  //console.log(minValue,minKey);
  //return `${minValue} ${translations[minKey]}`;
  return `${minValue} ${dateDiffWithCase} назад`;
}

function getDate(createdAtDate,updatedAtDate=''){
  if(updatedAtDate===''){
    return <em>Написано: {createdAtDate}</em>
  }
  return (
    <>
    <em>Написано: {createdAtDate}</em> <br />
    <em>Обновлено: {updatedAtDate}</em>
    </>
  );
}
export const Post: React.FunctionComponent<PostProps> = ({ data }) => {
  console.log('DATA',data);
  const createdAt = data.createdAt.slice(0,-11);
  const updatedAt = data.updatedAt.slice(0,-11);
  let date = <em></em>;
  const createdAtDate = formatDate(+new Date(createdAt));
  const updatedAtDate = formatDate(+new Date(updatedAt));
  if(createdAt===updatedAt){
    date=getDate(createdAtDate);
  }
  else{
    date=getDate(createdAtDate,updatedAtDate);
  }
  return (
    <div>
      <h2>{data.header}</h2>
      <p>
        {date}
      </p>
      <ReactMarkdown source={data.content} />
    </div>
  );
};
