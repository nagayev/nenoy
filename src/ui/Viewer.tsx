import React from "react";
type ViewerProps = {
  source: any;
};
function Viewer(props: ViewerProps) {
  const { source } = props;
  return <div dangerouslySetInnerHTML={{ __html: source }}></div>;
}
export default Viewer;
