import React from "react";

import { LogModal, RegModal } from "./Modals";
import User from "./User";
import NoSsr from "./no";
import { detectMobile, getDefaultTheme } from "./utils";
import {types,headers} from './objectTypes';

interface MenuInterface {
  updateState: (n: number) => any;
}

function DesktopMenu(props: MenuInterface) {
  return (
    <div>
      {Object.keys(types).map((key,i)=>{
        return (
          <span key={i}> 
            <a onClick={()=>{props.updateState(+types[key])}}>{headers[key]}</a>&nbsp;
          </span>
        );
      })}
    </div>
  );
}
function MobileMenu(props: MenuInterface) {
  const handler = (event) => props.updateState(+event.target.value);
  return (
    <select onChange={handler}>
      {Object.keys(types).map((key,i)=>{
        return <option key={i} value={types[key]}>{headers[key]}</option>
      })}
    </select>
  );
}
function _Menu(props: MenuInterface) {
  const style = getDefaultTheme();
  const { updateState } = props;
  const [isLogOpen, setLogOpen] = React.useState(false);
  const [isRegOpen, setRegOpen] = React.useState(false);
  const showLogIn = () => setLogOpen(true);
  const showRegistration = () => setRegOpen(true);
  const isMobile = detectMobile();
  const menu = isMobile ? (
    <MobileMenu updateState={updateState} />
  ) : (
    <DesktopMenu updateState={updateState} />
  );
  function LogAndReg(){
    return (
      <div>
        <a style={style.log} onClick={showLogIn}>
          Вход
        </a>
        &nbsp;
        <a style={style.reg} onClick={showRegistration}>
          Регистрация
        </a>
        &nbsp;
      </div>
    );
  }
  const Top = localStorage.getItem('token')?<User token={localStorage.getItem('token')} />:
    <LogAndReg />
  return (
    <div id="menu">   
      {Top}
      <RegModal isOpen={isRegOpen} setIsOpen={setRegOpen} />
      <LogModal isOpen={isLogOpen} setIsOpen={setLogOpen} />
      {menu}
    </div>
  );
}
function Menu(props: MenuInterface) {
  return (
    <NoSsr>
      <_Menu updateState={props.updateState} />
    </NoSsr>
  );
}
export default Menu;
