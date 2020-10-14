import React from "react";
import Modal from "react-modal";
import { wrap } from "./utils";

const customStyles = {
  content: {
    color: "black",
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

interface MapModalInterface {
  modalIsOpen: boolean;
  setIsOpen: Function;
  modalCoords: number[];
}

interface LogRegProps {
  isOpen: boolean;
  setIsOpen: Function;
}

function MapModal(props: MapModalInterface) {
  const { modalIsOpen, setIsOpen, modalCoords } = props;

  return (
    <>
      <Modal
        isOpen={modalIsOpen}
        /*onAfterOpen={afterOpenModal} */
        onRequestClose={wrap(setIsOpen, false)}
        style={customStyles}
        contentLabel="Example Modal"
      >
        {/*<h2 ref={_subtitle => (subtitle = _subtitle)}>Hello</h2> */}
        <button onClick={wrap(setIsOpen, false)}>close</button>
        <div>Кажется, об этом объекте никто не писал.</div>
        <div>Станьте первым!</div>
        <div>
          Объект с координатами ({modalCoords[0]});({modalCoords[1]}){" "}
        </div>
      </Modal>
    </>
  );
}
function LogModal(props: LogRegProps) {
  const { isOpen, setIsOpen } = props;
  //NOTE: login NotImplemented!
  function login(){
    return 1;
  }
  return (
    <>
      <Modal
        isOpen={isOpen}
        /*onAfterOpen={afterOpenModal} */
        onRequestClose={wrap(setIsOpen, false)}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <button onClick={wrap(setIsOpen, false)}>close</button>
        <h2>Вход</h2>
        <p>Пожалуйста, введите свой логин и пароль</p>
        <p>Логин</p>
        <input type="text" /> <br />
        <p>Пароль</p>
        <input type="password" />
        <br />
        <p>Или войдите с помощью этих сервисов</p>
        <p>Тут будет вк, гугл и т.д</p>
        <button onClick={login}>Войти</button>
      </Modal>
    </>
  );
}
function RegModal(props: LogRegProps) {
  const { isOpen, setIsOpen } = props;
  //NOTE: signup NotImplemented!
  function signup(){
    return 2;
  }
  return (
    <>
      <Modal
        isOpen={isOpen}
        onRequestClose={wrap(setIsOpen, false)}
        style={customStyles}
        /*contentLabel="Example Modal"  (?) */
      >
        <button onClick={wrap(setIsOpen, false)}>close</button>
        <h2>Регистрация</h2>
        <p>Логин</p>
        <input type="text" /> <br />
        <p>Пароль</p>
        <input type="password" /> <br />
        <p>Повторите пароль</p> <input type="password" />
        <br />
        <p>Или войдите с помощью этих сервисов</p>
        <p>Тут будет вк, гугл и т.д</p>
        <button onClick={signup}>Зарегестрироваться</button>
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
        style={customStyles}>
        <button onClick={wrap(setIsOpen, false)}>close</button> <br />
        Sorry, English version are coming
      </Modal>
    </>
  );
}
export {
  MapModal,
  LogModal,
  RegModal,
  Sorry
};