import React, { useEffect, useState } from "react";
import Modal from "react-modal";
//import ReactMarkdown from "react-markdown";
import Viwer from "./Viewer";
import Commentaries from "./Commentaries";
import Editor from "./Editor";
import { wrap } from "./utils";

import customStyles from "./ModalStyles";

function AddCommentaryModal(props) {
  const { isOpen, setIsOpen } = props;
  const [content, setContent] = React.useState("");
  const send = (arg) => console.log(arg);
  return (
    <>
      <Modal
        isOpen={isOpen}
        onRequestClose={wrap(setIsOpen, false)}
        style={customStyles}
      >
        <button onClick={wrap(setIsOpen, false)}>закрыть</button> <br />
        <h2>Написать комментарий</h2>
        <Editor content={content} setContent={setContent} />
        <button onClick={send}></button>
      </Modal>
    </>
  );
}
function PostModal(props) {
  const { isOpen, setIsOpen, data } = props;
  const [comments, setComments] = useState([]);
  const [commentaryIsOpen, setCommentaryIsOpen] = React.useState(false);
  const addCommentary = () => setCommentaryIsOpen(true);
  useEffect(() => {
    const opts = {
      method: "POST",
      body: `${data._id}`,
    };
    fetch("api/getComments", opts)
      .then((data) => data.json())
      .then((data) => setComments(data));
  }, [data._id]);
  return (
    <>
      <Modal
        isOpen={isOpen}
        onRequestClose={wrap(setIsOpen, false)}
        style={customStyles}
      >
        <button onClick={wrap(setIsOpen, false)}>закрыть</button> <br />
        <div>
          <h2>{data.header}</h2>
          <p>{data.date}</p>
          <Viwer source={data.content} />
          <Commentaries data={comments} />
          <button onClick={addCommentary}>Добавить комментарий</button>
          <AddCommentaryModal
            isOpen={commentaryIsOpen}
            setIsOpen={setCommentaryIsOpen}
          />
        </div>
      </Modal>
    </>
  );
}
export { AddCommentaryModal, PostModal };
