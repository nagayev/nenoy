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
  data: any; //DataType;
  setPosts: Function;
}

//TODO: rename this function!
function InfoFromDBModal(props: MapModalInterface) {
  const { modalIsOpen, setIsOpen, data, setPosts } = props;
  const [addPostIsOpen, setAddPostIsOpen] = React.useState(false);
  const [header, setHeader] = React.useState("");
  const [content, setContent] = React.useState("");
  let id, type;
  const sendInformation = () => {
    const date = +new Date();
    let sendData = {
      header,
      content,
      type: props.data[0].type,
      parent_object_id: props.data[0].parent_object_id,
      createdAt: date,
      updatedAt: date,
    };
    let opts = { method: "post", body: JSON.stringify(sendData) };
    console.log(sendData);
    if (sendData.header === "") {
      alert("Заголовок не может быть пустым");
      return;
    }
    if (sendData.content === "") {
      alert("Содержимое не должно быть пустым");
      return;
    }
    const thanks =
      "Спасибо за отправку записи!\nВ ближайшее время наш модератор проверит ее";
    alert(thanks);
    fetch("api/sendInformation", opts).then((data) => console.log(data));
    setAddPostIsOpen(false);
    setIsOpen(false);
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
            <input type="text" onChange={(e) => setHeader(e.target.value)} />
            <br />
            <p>Содержимое поста:</p>
            <Editor content={content} setContent={setContent} />
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
  const [place2, setPlace2] = React.useState("не указано"); //FIXME: refactor
  const [vk2, setVk2] = React.useState("не указан"); //FIXME: refactor
  const [userData,setUserData] = React.useState({
    rank:0,
    place:'не указано',
    vk:'не указан',
    name:'',
    registration:''
  });
  
  const logOut = () => {
    if (confirm("Вы уверены, что хотите выйти?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("id");
      setIsOpen(false);
      location.reload();
    }
  };

  //NOTE: _id,login,password are excluded (private data)
  type UserType = {
    name: string;
    rank: number;
    place: string;
    vk: string;
    registration: string; 
  };
  function getFormatedDate(date){
    return new Intl.DateTimeFormat().format(date);
  } 
  //const getFormatedDate = (date) => `${date.getDate()}:${date.getMonth()+1}:${date.getFullYear()}`;
  const setUserInfo = (data: UserType) => {
    data.registration=getFormatedDate(new Date(data.registration));
    const copy = Object.assign({},userData,data);
    setUserData(copy);
    //NOTE: this's fix for #11 (https://github.com/nagayev/nenoy/issues/11)
    setPlace2(data.place);
    setVk2(data.vk);
  };
  useEffect(() => {
    //load info about user
    fetch("/api/getUserInfo", {
      method: "POST",
      body: JSON.stringify({ id: localStorage.getItem("id") }),
    })
      .then((data) => data.json())
      .then((data) => setUserInfo(data))
      .catch((err) => console.log(err));
  }, []);
  function sendUserData() {
    const sendData = {
      token: localStorage.getItem("token"),
      place: place2,
      vk: vk2
    };
    //console.log(userData);
    fetch("/api/updateUserInfo", {
      method: "POST",
      body: JSON.stringify(sendData),
    })
      .then((data) => data.json())
      .then((data) => console.log(data))
      .catch((err) => console.log(err));
  }
  return (
    <>
      <Modal
        isOpen={isOpen}
        onRequestClose={wrap(setIsOpen, false)}
        style={customStyles}
      >
        <button onClick={wrap(setIsOpen, false)}>закрыть</button>
        <div>
          <h1>{userData.name}</h1>
          <p>Дата регистрации: {userData.registration}</p>
          <p>Рейтинг: {userData.rank} </p>
          <div style={{ display: "inline-flex" }}>
            ВК:&nbsp;
            <div
              contentEditable={true}
              onInput={(e) => setVk2((e.target as HTMLDivElement).innerHTML)}
              dangerouslySetInnerHTML={{ __html: userData.vk }}
            ></div>
          </div>{" "}
          <br />
          <div style={{ display: "inline-flex" }}>
            Город:{" "}
            <div
              contentEditable={true}
              onInput={(e) => setPlace2((e.target as HTMLDivElement).innerHTML)}
              dangerouslySetInnerHTML={{ __html: userData.place }}
            ></div>
          </div>
        </div>
        <p>Личный кабинет дорабатывается...</p>
        <button onClick={sendUserData}>Сохранить</button> &nbsp;
        <button onClick={logOut}>выйти</button>
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
