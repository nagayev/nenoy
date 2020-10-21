import React from "react";
import {UserModal} from "./Modals"

interface UserInterface{
    token:null|string
}

function User(props:UserInterface){
    const [modalIsOpen,setIsOpen] = React.useState(false);
    return (
        <>
        <p onClick={()=>setIsOpen(true)}>Marat Nagayev</p>
        <UserModal isOpen={modalIsOpen} setIsOpen={setIsOpen} />
        </>
    );
}
export default User;