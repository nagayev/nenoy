import ReactMarkdown from "react-markdown";
import React from "react";
import moment from "moment";

interface PostProps {
  data: PostData;
}
interface PostData {
    date: number;
    header: string;
    content: string;
}

function formatDate(ms:number):string{
    moment.locale('ru');
    return moment(ms).fromNow();
}

export const Post: React.FunctionComponent<PostProps> = ({ data }) => {
  const formattedDate = formatDate(data.date);
  return (
    <div>
      <h2>{data.header}</h2>
      <p>
        <em>Дата написания: {formattedDate}</em>
      </p>
      <ReactMarkdown source={data.content} />
    </div>
  );
};
