import React from "react";
import NoSSR from "./no";
import { Sorry } from "./Modals";
import { ChangeRegLogModal } from "./LogRegModals";
import User from "./User";
import { getDefaultTheme, wrap } from "./utils";

function Logo() {
  const [isOpen, setIsOpen] = React.useState(false);
  const loginAndReg = () => setIsOpen(true);
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
  React.useEffect(() => {
    if (token) {
      //Checking token...
      const opts = { method: "post", body: JSON.stringify({ token }) };
      fetch("api/isCorrect", opts)
        .then((data) => data.json())
        .then((data) => check(data))
        .catch((err) => console.error(err));
    }
  }, []);
  if (isTokenValid) return <User />;
  return (
    <>
      <ChangeRegLogModal isOpen={isOpen} setIsOpen={setIsOpen} />
      <img width="32px" src={"user.png"} onClick={loginAndReg} />
    </>
  );
}
function TopMenu() {
  const style = getDefaultTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div style={style.languages}>
      <a style={style.dots} href="#" onClick={wrap(setIsOpen, true)}>
        en
      </a>
      &nbsp;
      <a style={style.dots} href="#">
        ru
      </a>
      <NoSSR>
        <Logo />
      </NoSSR>
      <Sorry isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
}
export default TopMenu;
