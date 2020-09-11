import dark from "./dark";
function wrap(f:Function,...args){
    return ()=>{
        f.apply(undefined,args)
    }
}
function getDefaultTheme(){
    return dark;
}
export {wrap,getDefaultTheme};