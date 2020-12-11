import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { wrap, MD5, isValidEmail, isErrorWithCode } from "./utils";
import ReactMarkdown from "react-markdown";
import Commentaries from "./Commentaries";
const errors = require("./errors");
console.log(errors);
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
  data: any; //TODO:
  setPosts: Function;
}

interface LogRegProps {
  isOpen: boolean;
  setIsOpen: Function;
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
function LogModal(props: LogRegProps) {
  const { isOpen, setIsOpen } = props;
  const [login, setLogin] = React.useState("");
  const [password, setPassword] = React.useState("");
  const check = (data) => {
    if (isErrorWithCode(data, errors.INVALID_LOGIN)) {
      alert("Неправильный логин и/или пароль");
    } else {
      localStorage.setItem("token", data.token);
      localStorage.setItem("id", data.id);
      alert("Вы успешно авторизировались");
      setIsOpen(false);
    }
  };
  function recoverPassword() {
    const sendData = {
      login,
    };
    let opts = { method: "post", body: JSON.stringify(sendData) };
    fetch("/api/recover", opts).then((data) => {
      console.log(data);
      if (isErrorWithCode(data, errors.INVALID_LOGIN)) {
        alert("Неправильный логин");
      } else {
        alert(
          "Письмо с информацией о восстановлении пароля отправлено Вам на почту",
        );
      }
    });
  }
  function signin() {
    const sendData = {
      login,
      password: MD5(password),
    };
    let opts = { method: "post", body: JSON.stringify(sendData) };
    fetch("/api/signin", opts)
      .then((data) => data.json())
      .then((data) => check(data));
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
        <button onClick={wrap(setIsOpen, false)}>закрыть</button>
        <h2>Вход</h2>
        <p>Пожалуйста, введите свой логин и пароль</p>
        <p>Логин</p>
        <input onChange={(e) => setLogin(e.target.value)} type="text" /> <br />
        <p>Пароль</p>
        <input onChange={(e) => setPassword(e.target.value)} type="password" />
        <br />
        <button onClick={signin}>Войти</button>
        <p>Забыли пароль?</p>
        <button onClick={recoverPassword}>Восстановить</button>
      </Modal>
    </>
  );
}
function RegModal(props: LogRegProps) {
  const { isOpen, setIsOpen } = props;
  const [login, setLogin] = React.useState("");
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [anotherPassword, setAnotherPassword] = React.useState("");

  function signup() {
    const emitError = alert;
    if (password !== anotherPassword) {
      emitError("Пароли не совпадают!");
      return;
    }
    if (!isValidEmail(login)) {
      emitError("Неверный email!");
      return;
    }
    if (password.length < 8) {
      emitError("Пароль должен состоять минимум из 8 знаков");
      return;
    }
    const sendData = {
      login,
      name,
      password: MD5(password),
    };
    let opts = { method: "post", body: JSON.stringify(sendData) };
    const checkError = (error) => {
      if (isErrorWithCode(error, errors.BUSY_LOGIN)) {
        alert("Пользователь с таким логином уже существует!");
        return;
      } else {
        alert("Вы успешно зарегистрировались.");
        setIsOpen(false);
        return;
      }
    };
    fetch("/api/signup", opts)
      .then((data) => data.json())
      .then((data) => checkError(data));
  }
  return (
    <>
      <Modal
        isOpen={isOpen}
        onRequestClose={wrap(setIsOpen, false)}
        style={customStyles}
        /*contentLabel="Example Modal"  (?) */
      >
        <button onClick={wrap(setIsOpen, false)}>закрыть</button>
        <h2>Регистрация</h2>
        <p>Email</p>
        <input onChange={(e) => setLogin(e.target.value)} type="text" /> <br />
        <p>Имя</p>
        <input onChange={(e) => setName(e.target.value)} type="text" /> <br />
        <p>Пароль</p>
        <input
          onChange={(e) => setPassword(e.target.value)}
          type="password"
        />{" "}
        <br />
        <p>Повторите пароль</p>{" "}
        <input
          onChange={(e) => setAnotherPassword(e.target.value)}
          type="password"
        />
        <br /> <br />
        <button onClick={signup}>Зарегестрироваться</button>
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
function PostModal(props) {
  const { isOpen, setIsOpen, data } = props;
  const [comments, setComments] = useState([]);
  console.log(data);
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
          <ReactMarkdown source={data.content} />
          <Commentaries data={comments} />
        </div>
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
export { InfoFromDBModal, LogModal, RegModal, Sorry, UserModal, PostModal };
