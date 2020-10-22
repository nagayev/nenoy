import moment from "moment";
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

//FIXME: moment is legacy!
function formatDate(ms: number): string {
  moment.locale("ru");
  return moment(ms).fromNow();
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
