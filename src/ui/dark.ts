import { CSSProperties } from "react";

const me: CSSProperties = {
  marginRight: "20%",
  width: "100px",
  height: "100px",
  float: "right",
  WebkitFilter: "grayscale(100%)",
  msFilter: "grayscale(100%)",
  filter: "grayscale(100%)",
};
const about: CSSProperties = {
  textAlign: "left",
  marginLeft: "30%",
};
const map : CSSProperties = {
  textAlign:"center",
  marginLeft: "auto",
  marginRight: "auto"
};
const menu : CSSProperties = {
  textAlign:"left",
  marginLeft:"-90%"
};
const a : CSSProperties = {
  color: "white",
};
const log : CSSProperties = {
  color: "red",
  marginRight:'10%'
};
const reg : CSSProperties = {
  color: "red",
  marginRight:'-10%'
};
const pageLayout: CSSProperties = {
  backgroundColor: "black",
  color: "white",
  textAlign: "center",
  fontFamily: "Montserrat",
};
const languages: CSSProperties = {
  float: "right",
  marginRight: "5%",
};
const dots: CSSProperties = {
  textDecoration: "underline",
  color: "white",
};
const dark = {
  a,
  about,
  pageLayout,
  map,
  me,
  menu,
  languages,
  log,
  reg,
  dots
};
export default dark;
