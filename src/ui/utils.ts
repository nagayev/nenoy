import dark from "./dark";

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
export { wrap, getDefaultTheme, detectMobile };
