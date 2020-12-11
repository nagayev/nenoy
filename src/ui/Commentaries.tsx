import React from "react";

type CommentaryType = { rank: number; username: string; text: string };

function Commentary(props: { data: CommentaryType }) {
  //const data = {props};
  let color = props.data.rank > 0 ? "green" : "red";
  if (props.data.rank === 0) color = "black";
  const sign = props.data.rank > 0 ? "+" : "";
  return (
    <div>
      <div style={{ display: "inline-flex" }}>
        <p>{props.data.username}&nbsp;</p>
        <p style={{ color: color }}>
          ({sign}
          {props.data.rank})
        </p>
      </div>
      <p>{props.data.text}</p>
    </div>
  );
}
function Commentaries(props: { data: CommentaryType[] }) {
  const commentaries = props.data.map((v, i) => {
    return <Commentary data={v} key={i} />;
  });
  return (
    <>
      <h2>Комментарии ({props.data.length})</h2>
      {commentaries}
    </>
  );
}
export default Commentaries;
