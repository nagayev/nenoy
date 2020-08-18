import { CSSProperties } from "react";

const me: CSSProperties = {
  marginRight: "20%",
  width: "100px",
  height: "100px",
  float: "right",
};
const about: CSSProperties = {
  textAlign: "left",
  marginLeft: "30%",
};
const a: CSSProperties = {
  //textDecoration: 'none',
  color: "black",
};
const pageLayout: CSSProperties = {
  backgroundColor: "white",
  color: "black",
  textAlign: "center",
  fontFamily: "Montserrat",
};
const languages: CSSProperties = {
  float: "right",
  marginRight: "5%",
};
const light = {
  a,
  about,
  pageLayout,
  me,
  languages,
};
export default light;
