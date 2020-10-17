import React from "react";
import Modal from "react-modal";
import { wrap,MD5,isValidEmail } from "./utils";

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
        <button onClick={wrap(setIsOpen, false)}>закрыть</button>
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
  const [login,setLogin] = React.useState('');
  const [password,setPassword] = React.useState('');
  function signin(){
    const sendData = {
      login,
      password:MD5(password)
    }
    setIsOpen(false);
    let opts = {method:'post',body:JSON.stringify(sendData)}
    fetch('/api/signin',opts).then(data=>data.json()).then(data=>localStorage.key=data);
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
        <input onChange={(e)=>setLogin(e.target.value)} type="text" /> <br />
        <p>Пароль</p>
        <input onChange={(e)=>setPassword(e.target.value)} type="password" />
        <br />
        <p>Или войдите с помощью этих сервисов</p>
        <p>Тут будет вк, гугл и т.д</p>
        <button onClick={signin}>Войти</button>
      </Modal>
    </>
  );
}
function RegModal(props: LogRegProps) {
  const { isOpen, setIsOpen } = props;
  const [login,setLogin] = React.useState('');
  const [password,setPassword] = React.useState('');
  const [anotherPassword,setAnotherPassword] = React.useState('');

  function signup(){
    if(password!==anotherPassword){
      alert('Пароли не совпадают!');
      return;
    }
    if(!isValidEmail(login)){
      alert('Неверный email!');
      return;
    }
    const sendData = {
      login,
      password:MD5(password)
    }
    setIsOpen(false);
    let opts = {method:'post',body:JSON.stringify(sendData)}
    fetch('/api/signup',opts).then(data=>console.log(data));
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
        <p>Логин</p>
        <input onChange={(e)=>setLogin(e.target.value)} type="text" /> <br />
        <p>Пароль</p>
        <input onChange={(e)=>setPassword(e.target.value)} type="password" /> <br />
        <p>Повторите пароль</p> <input onChange={(e)=>setAnotherPassword(e.target.value)} type="password" />
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
        <button onClick={wrap(setIsOpen, false)}>закрыть</button> <br />
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