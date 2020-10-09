import React from "react";
import Modal from "react-modal"; //see https://github.com/reactjs/react-modal
import NoSsr from "./no";
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

type Function = (...args: any[]) => any;

interface MapModalInterface {
  modalIsOpen: boolean;
  setIsOpen: Function;
  modalCoords: number[];
}

interface AddPlacemarkInterface {
  isOpen: boolean;
  setIsOpen: Function;
  userPlacemark:any
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
        <button>Войти</button>
      </Modal>
    </>
  );
}
function RegModal(props: LogRegProps) {
  const { isOpen, setIsOpen } = props;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onRequestClose={wrap(setIsOpen, false)}
        style={customStyles}
        /*contentLabel="Example Modal"  (?) */
      >
        <button onClick={wrap(setIsOpen, false)}>close</button>
        <h2>Регестрация</h2>
        <p>Логин</p>
        <input type="text" /> <br />
        <p>Пароль</p>
        <input type="password" /> <br />
        <p>Повторите пароль</p> <input type="password" />
        <br />
        <p>Или войдите с помощью этих сервисов</p>
        <p>Тут будет вк, гугл и т.д</p>
        <button>Зарегестрироваться</button>
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
        /*onAfterOpen={afterOpenModal} */
        onRequestClose={wrap(setIsOpen, false)}
        style={customStyles}
        /*contentLabel="Example Modal"  (?) */
      >
        <button onClick={wrap(setIsOpen, false)}>close</button> <br />
        Sorry, English version are coming
      </Modal>
    </>
  );
}
function AddPlacemarkModal(props: AddPlacemarkInterface) {
  const { isOpen, setIsOpen, userPlacemark } = props;
  console.warn('user placemark',userPlacemark)
  const [firstModalIsOpen, setFirstIsOpen] = [isOpen, setIsOpen];
  const [secondModalIsOpen, setSecondIsOpen] = React.useState(false);
  const closeFirstModal = () => setFirstIsOpen(false);
  const savetlyOpenSecondModal = () => {
    setFirstIsOpen(false);
    setSecondIsOpen(true);
  };
  const types = {hospital:1,roads:2,schools:3}
  const [sendData,setSendData] = 
  React.useState({type:types.hospital,userPlacemark:userPlacemark,name:'',header:'',content:''});

  const areYouSureTo: any = (f: Function, m = "Выйти без сохранения?") =>
    confirm(m) ? f() : null;
  const closeSecondModal = () => setSecondIsOpen(false);
  const sendInformation = () => {
    const thanks = 'Спасибо за отправку записи!\nВ ближайшее время наш модератор проверит ее'; 
    alert(thanks);
    //FIXME: normal request
    console.warn("[STUB] Sending info to server...");
    let opts = {method:'post',body:JSON.stringify(sendData)}
    console.log(sendData);
    fetch('api/sendInformation',opts).then(data=>console.log(data));
    closeSecondModal();
  };
  const updateSendDataProp = (event,prop) => {
    var copy = Object.assign({},sendData);
    copy[prop]=event.target.value; 
    setSendData(copy);
  }
  return (
    <>
      <Modal
        isOpen={firstModalIsOpen}
        onRequestClose={closeFirstModal}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <button onClick={()=>areYouSureTo(closeFirstModal)}>close</button>
        <h2>Добавить информацию об объекте</h2>
        <p>Об этом объекте еще никто не писал!</p>
        <p>Станьте первым!</p>
        <div style={{ display: "contents" }}>
          <p>Выберите категорию объекта:</p>
          <select name="categories" onChange={(e)=>updateSendDataProp(e,"type")}>
            <option value="hospitals">Больницы</option>
            <option value="roads">Дороги</option>
            <option value="schools">Школы</option>
          </select>{" "}
          <br />
          <p>Название объекта:</p>
          <input type="text" onChange={(e)=>updateSendDataProp(e,"name")} />
        </div>{" "}
        <br />
        <button onClick={savetlyOpenSecondModal}>Сохранить</button>
      </Modal>
      <Modal
        isOpen={secondModalIsOpen}
        onRequestClose={()=>areYouSureTo(closeSecondModal)} //and open another modal
        style={customStyles}
        contentLabel="Example Modal"
      >
        <button onClick={closeSecondModal}>close</button>
        <h2>Спасибо за добавление информации!</h2>
        <p>Пожалуйста напишите о нем первую запись</p>
        <div style={{ display: "contents" }}>
          <p>Заголовок записи:</p>
          <input type="text" onChange={(e)=>updateSendDataProp(e,"header")} />
          <br />
          <p>Содержимое поста:</p>
          <textarea onChange={(e)=>updateSendDataProp(e,"content")}></textarea>
        </div>{" "}
        <br />
        <button onClick={sendInformation}>Отправить</button>
      </Modal>
    </>
  );
}
const AddPlacemarkModalwithNoSsr = (props: AddPlacemarkInterface) => {
  return (
    //NOTE: because confirm only for browser
    <NoSsr> 
      <AddPlacemarkModal isOpen={props.isOpen} setIsOpen={props.setIsOpen} userPlacemark={props.userPlacemark} />
    </NoSsr>
  );
};
export {
  MapModal,
  LogModal,
  RegModal,
  AddPlacemarkModalwithNoSsr as AddPlacemarkModal,
  Sorry,
};