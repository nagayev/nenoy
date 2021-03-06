import React, { useEffect } from "react";

import { LogModal, RegModal } from "./LogRegModals";
import User from "./User";
import NoSsr from "./no";
import { detectMobile, getDefaultTheme } from "./utils";
import { types, headers } from "./objectTypes";

interface MenuInterface {
  updateState: (n: number) => any;
}

function DesktopMenu(props: MenuInterface) {
  return (
    <div>
      {Object.keys(types).map((key, i) => {
        return (
          <span style={{ paddingLeft: "50px" }} key={i}>
            <a
              onClick={() => {
                props.updateState(+types[key]);
              }}
            >
              {headers[key]}
            </a>
            &nbsp;
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
      {Object.keys(types).map((key, i) => {
        return (
          <option key={i} value={types[key]}>
            {headers[key]}
          </option>
        );
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
  const token = localStorage.getItem("token");
  let [isTokenValid, setIsTokenValid] = React.useState(!!token);
  const check = (data: boolean): void => {
    if (!data) {
      console.warn("Token is deprecated!");
      setIsTokenValid(false);
      alert("Ваша сессия закончилась.\nПожалуйста, перезайдите в аккаунт");
      localStorage.clear();
    }
  };
  useEffect(() => {
    if (token) {
      //Checking token...
      const opts = { method: "post", body: JSON.stringify({ token }) };
      fetch("api/isCorrect", opts)
        .then((data) => data.json())
        .then((data) => check(data))
        .catch((err) => console.error(err));
    }
  }, []);
  return (
    <div id="menu">
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
