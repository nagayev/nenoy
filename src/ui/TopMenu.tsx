import React from "react";

import { Sorry } from "./Modal";
import { getDefaultTheme, wrap } from "./utils";

function TopMenu() {
  const style = getDefaultTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div style={style.languages}>
      <a style={style.dots} href="#" onClick={wrap(setIsOpen, true)}>
        en
      </a>{" "}
      <a style={style.dots} href="#">
        ru
      </a>
      <Sorry isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
}
export default TopMenu;
