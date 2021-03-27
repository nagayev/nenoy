import React from "react";
import { isErrorWithCode } from "./utils";
import Viwer from "./Viewer";
const errors = require("./errors");

type HTML = string;
type CommentaryType = {
  _id: string;
  text: HTML;
  post_id: string;
  user_id: string;
  rank: number;
  name: string;
};

function Commentary(props: { data: CommentaryType }) {
  //const data = {props};
  const [rank,setRank] = React.useState(props.data.rank);
  let color = props.data.rank > 0 ? "green" : "red";
  if (props.data.rank === 0) color = "black";
  const sign = props.data.rank > 0 ? "+" : "";
  console.log(props);
  const voteForComment = (vote) => {
    const sendData = {
      token:localStorage.token,
      commentId:props.data._id,
      vote
    }
    const opts = { method: "post", body: JSON.stringify(sendData)};
    fetch("api/voteForComment", opts)
      .then((data) => data.json())
      .then((data)=>{
        if(isErrorWithCode(data,errors.VOTE)){
          alert("Ошибка голосования");
        } else {
          setRank(rank+vote);  //update cache and show new rank
        }
      })
      .catch(err=>console.error(err));
  }
  
  return (
    <div>
      <div style={{ display: "inline-flex" }}>
        <p>{props.data.name}&nbsp;</p>
        <p style={{ color: color }}>
          ({sign}
          {rank})
        </p>
      </div>
      <button onClick={()=>voteForComment(1)}>+</button>
      <button onClick={()=>voteForComment(-1)}>-</button>
      <Viwer source={props.data.text} />
      <hr />
    </div>
  );
}
function Commentaries(props: { data: CommentaryType[] }) {
  const sendData = {};
  let commentary_data: any = []; // = props.data;
  let [commentaries, setCommentaries] = React.useState([]);
  React.useEffect(() => {
    sendData["id"] = props.data[0]?.user_id;
    //If count of comments is 0, we don't need to fetch
    if (!sendData["id"]) {
      return;
    }
    const opts = { method: "post", body: JSON.stringify(sendData) };
    fetch("api/getUserInfo", opts)
      .then((data) => data.json())
      .then((data) => {
        //NOTE: we iterate over commentaries and add name and rank to each comment
        commentary_data = props.data.map((v, i) => {
          //v.rank = data.rank;
          v.name = data.name;
          return <Commentary data={v} key={i} />;
        });
        setCommentaries(commentary_data);
      });
  }, []);
  return (
    <>
      <h2>Комментарии ({props.data.length})</h2>
      <hr />
      {commentaries}
    </>
  );
}
export default Commentaries;
