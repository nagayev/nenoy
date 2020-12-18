import React from "react";
import { UserModal } from "./Modals";
import { getDefaultTheme } from "./utils";

function User() {
  const style = getDefaultTheme();
  const [modalIsOpen, setIsOpen] = React.useState(false);
  return (
    <>
      <div onClick={() => setIsOpen(true)} style={style.user}>
        ЛК
      </div>
      <UserModal isOpen={modalIsOpen} setIsOpen={setIsOpen} />
    </>
  );
}
export default User;
