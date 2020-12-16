import React, { useEffect } from "react";
import Modal from "react-modal";
//import AddPostModal from "./AddPostModal"; //TODO: split modals.tsx
import Editor from "./Editor";
import { wrap, areYouSureTo } from "./utils";

import customStyles from "./ModalStyles";
import NoSsr from "./no";

type DataType = {
  parent_object_id: string;
  type: number;
};
interface MapModalInterface {
  modalIsOpen: boolean;
  setIsOpen: Function;
  data: DataType;
  setPosts: Function;
}

//TODO: rename this function!
function InfoFromDBModal(props: MapModalInterface) {
  const { modalIsOpen, setIsOpen, data, setPosts } = props;
  const [addPostIsOpen, setAddPostIsOpen] = React.useState(false);
  const [content, setContent] = React.useState("");
  let [sendData, setSendData] = React.useState({
    header: "",
    content: "",
  });
  let id, type;
  const sendInformation = () => {
    const thanks =
      "Спасибо за отправку записи!\nВ ближайшее время наш модератор проверит ее";
    alert(thanks);
    const date = +new Date();
    sendData["createdAt"] = date;
    sendData["updatedAt"] = date;
    sendData["parent_object_id"] = props.data[0].parent_object_id;
    sendData["type"] = props.data[0].type;
    let opts = { method: "post", body: JSON.stringify(sendData) };
    fetch("api/sendInformation", opts).then((data) => console.log(data));
    setAddPostIsOpen(false);
    setIsOpen(false);
  };
  const updateSendDataProp = (event, prop) => {
    const copy = Object.assign({}, sendData);
    copy[prop] = event.target.value;
    setSendData(copy);
  };
  const show = () => {
    setPosts(data);
    setIsOpen(false);
  };
  const writeAboutObject = () => {
    id = props.data[0].parent_object_id;
    type = props.data[0].type;
    setAddPostIsOpen(true);
    setIsOpen(false);
  };
  return (
    <>
      <Modal
        isOpen={modalIsOpen}
        /*onAfterOpen={afterOpenModal} */
        onRequestClose={wrap(setIsOpen, false)}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <button onClick={wrap(setIsOpen, false)}>закрыть</button>
        <h1>Что вы хотите?</h1>
        <div>
          <p>
            <button onClick={writeAboutObject}>Написать</button>&nbsp;об объекте
          </p>
          <p>
            {" "}
            <button onClick={show}>Посмотреть</button>&nbsp;записи об объекте
          </p>
        </div>
      </Modal>
      <NoSsr>
        <Modal
          isOpen={addPostIsOpen}
          onRequestClose={wrap(setAddPostIsOpen, false)}
          style={customStyles}
          contentLabel="Example Modal"
          appElement={document.body}
        >
          <button onClick={() => areYouSureTo(wrap(setAddPostIsOpen, false))}>
            закрыть
          </button>
          <div style={{ display: "contents" }}>
            <p>Заголовок записи:</p>
            <input
              type="text"
              onChange={(e) => updateSendDataProp(e, "header")}
            />
            <br />
            <p>Содержимое поста:</p>
            <Editor
              content={content}
              setContent={setContent}
              setState={updateSendDataProp}
            />
          </div>{" "}
          <br />
          <button onClick={sendInformation}>Отправить</button>
        </Modal>
      </NoSsr>
    </>
  );
}

function UserModal(props) {
  const { isOpen, setIsOpen } = props;
  const [rank, setRank] = React.useState(0);
  const [place, setPlace] = React.useState("не указано");
  const [name, setName] = React.useState("");

  const logOut = () => {
    if (confirm("Вы уверены, что хотите выйти?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("id");
      setIsOpen(false);
      location.reload();
    }
  };

  //_id,login,password are excluded
  type UserType = {
    name: string;
    rank: number;
    place: string;
  };
  const callback = (data: UserType) => {
    setRank(data.rank);
    setName(data.name);
    setPlace(data.place);
  };
  useEffect(() => {
    //load info about user
    fetch("/api/getUserInfo", {
      method: "POST",
      body: JSON.stringify({ id: localStorage.getItem("id") }),
    })
      .then((data) => data.json())
      .then((data) => callback(data))
      .catch((err) => console.log(err));
  }, []);
  return (
    <>
      <Modal
        isOpen={isOpen}
        onRequestClose={wrap(setIsOpen, false)}
        style={customStyles}
        /*contentLabel="Example Modal"  (?) */
      >
        <button onClick={wrap(setIsOpen, false)}>закрыть</button>
        <h1>{name} </h1>
        <p>Рейтинг: {rank} </p>
        <p>Город: {place}</p>
        <p>Личный кабинет дорабатывается...</p>
        <p onClick={logOut}>выйти</p>
      </Modal>
    </>
  );
}

function Sorry(props) {
  const { isOpen, setIsOpen } = props;
  return (
    <>
      <Modal
        isOpen={isOpen}
        onRequestClose={wrap(setIsOpen, false)}
        style={customStyles}
      >
        <button onClick={wrap(setIsOpen, false)}>закрыть</button> <br />
        Sorry, English version are coming
      </Modal>
    </>
  );
}
export { InfoFromDBModal, Sorry, UserModal };
