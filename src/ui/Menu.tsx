import React from "react"
import {LogModal,RegModal} from "./Modal"
import dark from "./dark";

//FIXME: GOVNOCODE

type Function = (n:number) => any;
interface MenuInterface{
    updateState:Function
}


function Menu(props:MenuInterface){
    const {updateState} = props;

    const [isLogOpen,setLogOpen] = React.useState(false);
    const [isRegOpen,setRegOpen] = React.useState(false);
    const showLogIn = () => setLogOpen(true);
    const showRegistration = () => setRegOpen(true);
    return (
        <div>
            <div>
                <a style={dark.log} onClick={()=>{showLogIn()}}>Вход</a>&nbsp;
                <a style={dark.reg} onClick={()=>showRegistration()}>Регестрация</a>&nbsp;
            </div>
            <RegModal isOpen={isRegOpen} setIsOpen={setRegOpen} />
            <LogModal isOpen={isLogOpen} setIsOpen={setLogOpen} />
            <div>
                <a onClick={()=>updateState(0)}>Посты</a>&nbsp;
                <a onClick={()=>updateState(1)}>Больницы</a>&nbsp;
                <a onClick={()=>updateState(2)}>Заводы</a>
            </div>
        </div>
    );
}
export default Menu;