import React from "react";
import Modal from "react-modal";
import NoSsr from "./no";
import {types} from "./objectTypes";

interface AddPlacemarkInterface {
    isOpen: boolean;
    setIsOpen: Function;
    userPlacemark:number[],
    deleteUserPlacemark:Function
}

type VoidFunction = (...args: any[]) => undefined;

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

function AddPlacemarkModalWithoutSSR(props: AddPlacemarkInterface) {
    const { isOpen, setIsOpen,userPlacemark, deleteUserPlacemark } = props;
    const [firstModalIsOpen, setFirstIsOpen] = [isOpen, setIsOpen];
    const [secondModalIsOpen, setSecondIsOpen] = React.useState(false);
    const closeFirstModal = () => setFirstIsOpen(false);
    const savetlyOpenSecondModal = () => {
      closeFirstModal();
      setSecondIsOpen(true);
    };
    const savetlyCloseFirstModal = () => {
        closeFirstModal();
        deleteUserPlacemark();
    }

    const [sendData,setSendData] = 
    React.useState({type:types.hospital,name:'',header:'',content:''}); //NOTE: without coords!
    const areYouSureTo: VoidFunction = (f: VoidFunction, m = "Выйти без сохранения?") =>
      confirm(m) ? f() : undefined;
    const closeSecondModal = () => setSecondIsOpen(false);
    const sendInformation = () => {
      const thanks = 'Спасибо за отправку записи!\nВ ближайшее время наш модератор проверит ее'; 
      alert(thanks);
      sendData['coords']=userPlacemark; //NOTE: it's too hard to explain this hack
      let opts = {method:'post',body:JSON.stringify(sendData)}
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
          appElement={document.body}
          contentLabel="Example Modal"
        >
          <button onClick={()=>areYouSureTo(savetlyCloseFirstModal)}>закрыть</button>
          <h2>Добавить информацию об объекте</h2>
          <p>Об этом объекте еще никто не писал!</p>
          <p>Станьте первым!</p>
          <div style={{ display: "contents" }}>
            <p>Выберите категорию объекта:</p>
            <select name="categories" onChange={(e)=>updateSendDataProp(e,"type")}>
              <option value={types.hospital}>Больницы</option>
              <option value={types.roads}>Дороги</option>
              <option value={types.schools}>Школы</option>
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
          onRequestClose={()=>areYouSureTo(closeSecondModal)} 
          style={customStyles}
          contentLabel="Example Modal"
          appElement={document.body}
        >
          <button onClick={closeSecondModal}>закрыть</button>
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
const AddPlacemarkModal = (props: AddPlacemarkInterface) => {
    return (
      //NOTE: because window.confirm only for browser
      <NoSsr> 
        <AddPlacemarkModalWithoutSSR isOpen={props.isOpen} 
        setIsOpen={props.setIsOpen} 
        userPlacemark={props.userPlacemark}
        deleteUserPlacemark={props.deleteUserPlacemark} 
        />
      </NoSsr>
    );
};
export default AddPlacemarkModal;