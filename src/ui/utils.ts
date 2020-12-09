import dark from "./dark";
import MD5 from "./md5";

type voidFunction = () => void;
type JSONString = string;

function wrap(f: Function, ...args): voidFunction {
  return () => {
    // eslint-disable-next-line prefer-spread
    f.apply(undefined, args);
  };
}
function getDefaultTheme() {
  return dark;
}
function detectMobile(): boolean {
  const ua = navigator.userAgent;
  const isAndroid = ua.match(/Android/i);
  const isIOS = ua.match(/iPhone|iPad|iPod/i);
  return isAndroid !== isIOS; //isAndroid maybe null
}
function deleteKeys(obj: object, deleteKeys: string[]): void {
  for (let i in obj) {
    if (deleteKeys.includes(i)) delete obj[i];
  }
}
function isValidEmail(email: string): boolean {
  //https://stackoverflow.com/a/46181
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
function isErrorWithCode(error: object, code: number): boolean {
  console.log(error, code);
  //because {a:1}!=={a:1}
  return JSON.stringify(error) === JSON.stringify({ error: code });
}
function formatError(code: number): JSONString {
  return JSON.stringify({ error: code });
}
function formatOk(): JSONString {
  return JSON.stringify({ error: -1 });
}
function getDateWithCase(n: number, textForms: string[]): string {
  //https://realadmin.ru/coding/sklonenie-na-javascript.html
  let n1;
  n = Math.abs(n) % 100;
  n1 = n % 10;
  if (n > 10 && n < 20) {
    return textForms[2];
  }
  if (n1 > 1 && n1 < 5) {
    return textForms[1];
  }
  if (n1 == 1) {
    return textForms[0];
  }
  return textForms[2];
}
function saveFirstWords(content: string): string {
  return content.split(" ").slice(0, 50).join(" ");
}
export {
  wrap,
  getDefaultTheme,
  detectMobile,
  deleteKeys,
  MD5,
  isValidEmail,
  isErrorWithCode,
  formatError,
  formatOk,
  getDateWithCase,
  saveFirstWords,
};
