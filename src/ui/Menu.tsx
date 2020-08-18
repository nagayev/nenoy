type Function = (n:number) => any;
interface MenuInterface{
    updateState:Function
}

function Menu(props:MenuInterface){
    const {updateState} = props;
    return (
        <div>
            <p onClick={()=>updateState(0)}>Посты</p>
            <p onClick={()=>updateState(1)}>Больницы</p>
            <p onClick={()=>updateState(2)}>Заводы</p>
        </div>
    );
}
export default Menu;