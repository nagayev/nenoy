import React, { useEffect, useState } from "react";
import Modal from "react-modal";
//import ReactMarkdown from "react-markdown";
import Viwer from "./Viewer";
import Commentaries from "./Commentaries";
import Editor from "./Editor";
import { wrap } from "./utils";

import customStyles from "./ModalStyles";

type AddCommentaryModalProps = {
  isOpen: boolean;
  setIsOpen: Function;
  post_id: string;
};
function AddCommentaryModal(props: AddCommentaryModalProps) {
  const { isOpen, setIsOpen, post_id } = props;
  const [content, setContent] = React.useState("");
  const token = localStorage.getItem("token");
  const body = {
    text: content,
    post_id: post_id,
    token: localStorage.token,
  };
  const opts = {
    method: "post",
    body: JSON.stringify(body),
  };
  function send() {
    if (!token) {
      alert("Вы не авторизированы. \nВойдите чтобы комментрировать записи");
      setIsOpen(false);
      return <div />;
    }
    //console.log("PostModal.tsx:35", opts);
    fetch("api/addComment", opts)
      .then((data) => data.json())
      .then((data) => console.log(data));
    alert("Ваш комментарий отправлен на модерацию");
    setIsOpen(false);
  }
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
        <button onClick={send}>Отправить</button>
      </Modal>
    </>
  );
}
function PostModal(props) {
  console.log("PostModal.tsx:50: ", props);
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
            post_id={data._id}
          />
        </div>
      </Modal>
    </>
  );
}
export { AddCommentaryModal, PostModal };
