import React from "react"
import {getDefaultTheme} from "./utils";
import {wrap} from "./utils"
import {Sorry} from "./Modal"


function TopMenu(){  
    const style=getDefaultTheme();
    const [isOpen,setIsOpen] = React.useState(false);
    return (
        <div style={style.languages}>
                <a style={style.dots} href="#" onClick={wrap(setIsOpen,true)}>
                en
                </a>{" "}
                <a style={style.dots} href="#">
                ru
                </a>
        </div>
    );
}
export default TopMenu;