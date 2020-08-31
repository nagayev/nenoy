import React, { useEffect } from "react"
import Modal from 'react-modal'; //see https://github.com/reactjs/react-modal
import NoSsr from "./no";

const customStyles = {
    content : {
      color:'black',
      top                   : '50%',
      left                  : '50%',
      right                 : 'auto',
      bottom                : 'auto',
      marginRight           : '-50%',
      transform             : 'translate(-50%, -50%)'
    }
};

type Function = (...args:any[]) => any;

interface MapModalInterface {
    modalIsOpen:boolean,
    setIsOpen:Function,
    modalCoords:number[]
}

interface AddPlacemarkInterface{
    isOpen:boolean,
    setIsOpen:Function,
    //modalCoords:any
}

function MapModal(props:MapModalInterface){
    const {modalIsOpen,setIsOpen,modalCoords} = props;
    const closeModal = () => setIsOpen(false);
    return (
        <>
            <Modal
                isOpen={modalIsOpen}
                /*onAfterOpen={afterOpenModal} */
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel="Example Modal">

                    {/*<h2 ref={_subtitle => (subtitle = _subtitle)}>Hello</h2> */}
                <button onClick={closeModal}>close</button>
                <div>Кажется, об этом объекте никто не писал.</div>
                <div>Станьте первым!</div>
                <div>Объект с координатами ({modalCoords[0]});({modalCoords[1]}) </div>
            </Modal>
        </>
    );
}
function LogModal(props){
    const isOpen = props.isOpen?true:false;
    const [modalIsOpen,setIsOpen] = React.useState(isOpen);
    const closeModal = () => setIsOpen(false);
    return (
        <>
            <Modal
                isOpen={modalIsOpen}
                /*onAfterOpen={afterOpenModal} */
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel="Example Modal">
                <button onClick={closeModal}>close</button>
                <h2>Вход</h2>
                <p>Пожалуйста, введите свой логин и пароль</p>
                <p>Логин</p><input type="text" /> <br />
                <p>Пароль</p><input type="password" />
                <br />
                <p>Или войдите с помощью этих сервисов</p>
                <p>Тут будет вк, гугл и т.д</p>
                <button>Войти</button>
            </Modal>
        </>
    );
}
function RegModal(props:any){
    console.log(props.isOpen);
    const {modalIsOpen,setIsOpen} = props;
    const closeModal = () => setIsOpen(false);
    return (
        <>
            <Modal
                isOpen={modalIsOpen}
                /*onAfterOpen={afterOpenModal} */
                onRequestClose={closeModal}
                style={customStyles}
                /*contentLabel="Example Modal"  (?) */>
                <button onClick={closeModal}>close</button>
                <h2>Регестрация</h2>
                <p>Логин</p><input type="text" /> <br />
                <p>Пароль</p><input type="password" /> <br />
                <p>Повторите пароль</p> <input type="password" />
                <br />
                <p>Или войдите с помощью этих сервисов</p>
                <p>Тут будет вк, гугл и т.д</p>
                <button>Зарегестрироваться</button>
            </Modal>
        </>
    );
}

/* function AddPlacemarkModal(props:AddPlacemarkInterface){
    //NOTE: savetlyOpenModal is close previous and open next
    const {isOpen,setIsOpen} = props;
    //const closeModal = () => setIsOpen(false);
    const firstIsOpen = props.isOpen===true;
    const [firstModalIsOpen,setFirstIsOpen] = React.useState(firstIsOpen);
    const [secondModalIsOpen,setSecondIsOpen] = React.useState(false);
    const closeFirstModal = () => {
        setFirstIsOpen(false);
        //setSecondIsOpen(true);
    }
    const savetlyOpenSecondModal = ()=>{
        setFirstIsOpen(false);
        setSecondIsOpen(true);
    }
    const areYouSureTo = (f:Function,m:string='Выйти без сохранения?') => confirm(m)?f:null;
    const closeSecondModal = () => setSecondIsOpen(false);
    const sendInformation = () => {
        console.warn('[STUB] Sending info to server...');
        closeSecondModal();
    }
    return (
        <>
            <Modal
                isOpen={firstModalIsOpen}
                onRequestClose={closeFirstModal} //and open another modal
                style={customStyles}
                contentLabel="Example Modal">
                <button onClick={()=>areYouSureTo(closeFirstModal)}>close</button>
                <h2>Добавить информацию об объекте</h2>
                <p>Об этом объекте еще никто не писал!</p>
                <p>Станьте первым!</p>
                <div style={{display:'contents'}}>
                    <p>Выберите категорию объекта:</p>
                    <select name = "categories">
                        <option value = "hospital">Больницы</option>
                        <option value = "road">Дороги</option>
                        <option value = "schools">Школы</option>
                    </select> <br />
                    <p>Название объекта:</p><input type="text" /> 
                </div> <br />
                <button onClick={savetlyOpenSecondModal}>Сохранить</button>
            </Modal>
            <Modal
                isOpen={secondModalIsOpen}
                onRequestClose={areYouSureTo(closeSecondModal)} //and open another modal
                style={customStyles}
                contentLabel="Example Modal">
                <button onClick={closeSecondModal}>close</button>
                <h2>Спасибо за добавление информации!</h2>
                <p>Пожалуйста напишите о нем первую запись</p>
                <div style={{display:'contents'}}>
                    <p>Заголовок записи:</p>
                    <input type="text" />
                    <br />
                    <p>Содержимое поста:</p><textarea></textarea>
                </div> <br />
                <button onClick={sendInformation}>Отправить</button>
            </Modal>
        </>
    );
} */
function AddPlacemarkModal(props:AddPlacemarkInterface){
    //NOTE: savetlyOpenModal is close previous and open next
    const {isOpen,setIsOpen} = props;
    //const closeModal = () => setIsOpen(false);
    //const firstIsOpen = props.isOpen===true;
    const [firstModalIsOpen,setFirstIsOpen] = [isOpen,setIsOpen]; 
    const [secondModalIsOpen,setSecondIsOpen] = React.useState(false);
    const closeFirstModal = () => setFirstIsOpen(false);
    const savetlyOpenSecondModal = ()=>{
        setFirstIsOpen(false);
        setSecondIsOpen(true);
    }
    const areYouSureTo:Function = (f:Function,m:string='Выйти без сохранения?') => confirm(m)?f:()=>{};
    const closeSecondModal = () => setSecondIsOpen(false);
    const sendInformation = () => {
        console.warn('[STUB] Sending info to server...');
        closeSecondModal();
    }
    return (
        <>
            <Modal
                isOpen={firstModalIsOpen}
                /*onAfterOpen={afterOpenModal} */
                onRequestClose={closeFirstModal} //and open another modal
                style={customStyles}
                contentLabel="Example Modal">
                <button onClick={()=>areYouSureTo(closeFirstModal)}>close</button>
                <h2>Добавить информацию об объекте</h2>
                <p>Об этом объекте еще никто не писал!</p>
                <p>Станьте первым!</p>
                <div style={{display:'contents'}}>
                    <p>Выберите категорию объекта:</p>
                    <select name = "categories">
                        <option value = "hospital">Больницы</option>
                        <option value = "road">Дороги</option>
                        <option value = "schools">Школы</option>
                    </select> <br />
                    <p>Название объекта:</p><input type="text" /> 
                </div> <br />
                <button onClick={savetlyOpenSecondModal}>Сохранить</button>
            </Modal>
            <Modal
                isOpen={secondModalIsOpen}
                /*onAfterOpen={afterOpenModal} */
                onRequestClose={areYouSureTo(closeSecondModal)} //and open another modal
                style={customStyles}
                contentLabel="Example Modal">
                <button onClick={closeSecondModal}>close</button>
                <h2>Спасибо за добавление информации!</h2>
                <p>Пожалуйста напишите о нем первую запись</p>
                <div style={{display:'contents'}}>
                    <p>Заголовок записи:</p>
                    <input type="text" />
                    <br />
                    <p>Содержимое поста:</p><textarea></textarea>
                </div> <br />
                <button onClick={sendInformation}>Отправить</button>
            </Modal>
        </>
    );
}
//NOTE: for browser only confirm function
const AddPlacemarkModalwithNoSsr = (props:AddPlacemarkInterface) => {
    const {isOpen,setIsOpen} = props
    return (
        <NoSsr><AddPlacemarkModal isOpen={isOpen} setIsOpen={setIsOpen} /></NoSsr>
    );
} 
export { MapModal,LogModal,RegModal,AddPlacemarkModalwithNoSsr as AddPlacemarkModal };