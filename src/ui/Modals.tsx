import React, { useEffect } from "react";
import Modal from "react-modal";
import { wrap } from "./utils";

import customStyles from "./ModalStyles";

interface MapModalInterface {
  modalIsOpen: boolean;
  setIsOpen: Function;
  data: any; //TODO:
  setPosts: Function;
}

//TODO: rename this function!
function InfoFromDBModal(props: MapModalInterface) {
  const { modalIsOpen, setIsOpen, data, setPosts } = props;
  const show = () => {
    setPosts(data);
    setIsOpen(false);
  };
  const write = () => {
    //TODO:
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
            <button onClick={write}>Написать</button>&nbsp;об объекте
          </p>
          <p>
            {" "}
            <button onClick={show}>Посмотреть</button>&nbsp;записи об объекте
          </p>
        </div>
      </Modal>
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
