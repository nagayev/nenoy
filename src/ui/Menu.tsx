import React from "react";

import { LogModal, RegModal } from "./Modal";
import { detectMobile, getDefaultTheme } from "./utils";

type Function = (n: number) => any;

interface MenuInterface {
  updateState: Function;
}
function DesktopMenu(props: any) {
  return (
    <div>
      <a onClick={() => props.updateState(0)}>Блог редакции</a>&nbsp;
      <a onClick={() => props.updateState(1)}>Больницы</a>&nbsp;
      <a onClick={() => props.updateState(2)}>Заводы</a>
    </div>
  );
}
function MobileMenu(props: any) {
  const c = (event) => props.updateState(+event.target.value);
  return (
    <select onChange={c}>
      <option value="0">Блог редакции</option>
      <option value="1">Больницы</option>
      <option value="2">Заводы</option>
    </select>
  );
}
function Menu(props: MenuInterface) {
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
  return (
    <div id="menu">
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
      <RegModal isOpen={isRegOpen} setIsOpen={setRegOpen} />
      <LogModal isOpen={isLogOpen} setIsOpen={setLogOpen} />
      {menu}
    </div>
  );
}
export default Menu;
