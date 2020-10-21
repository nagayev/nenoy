import dark from "./dark";
import MD5 from "./md5"

type voidFunction = ()=>void

function wrap(f: Function, ...args):voidFunction {
  return () => {
    // eslint-disable-next-line prefer-spread
    f.apply(undefined, args);
  };
}
function getDefaultTheme(){
  return dark;
}
function detectMobile():boolean {
  const ua = navigator.userAgent;
  const isAndroid = ua.match(/Android/i);
  const isIOS = ua.match(/iPhone|iPad|iPod/i);
  return Boolean(isAndroid || isIOS);
}
function isValidEmail(email:string):boolean{
  //https://stackoverflow.com/a/46181
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
function formatError(code:number):string{
  return JSON.stringify({error:code});
}
function formatOk(){
  return JSON.stringify({error:-1});
} 
export { wrap, getDefaultTheme, detectMobile,MD5,isValidEmail, formatError, formatOk };
