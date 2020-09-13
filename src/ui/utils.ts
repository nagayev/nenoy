import dark from "./dark";
function wrap(f: Function, ...args) {
  return () => {
    // eslint-disable-next-line prefer-spread
    f.apply(undefined, args);
  };
}
function getDefaultTheme() {
  return dark;
}
function detectMobile() {
  const ua = navigator.userAgent;
  const isAndroid = ua.match(/Android/i);
  const isIOS = ua.match(/iPhone|iPad|iPod/i);
  return isAndroid || isIOS;
}
export { wrap, getDefaultTheme, detectMobile };
