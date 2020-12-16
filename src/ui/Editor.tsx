import React, { useState, useRef } from "react";
import dynamic from "next/dynamic";
const importJodit = () => import("jodit-react");

const _Editor = dynamic(importJodit, {
  ssr: false,
});

type EditorProps = {
  setState?: Function;
  content: string;
  setContent: any;
};

const Editor = (props: EditorProps) => {
  const editor = useRef(null);
  const { content, setContent } = props;

  const config = {
    readonly: false, // all options from https://xdsoft.net/jodit/doc/
  };
  const onBlur = (content) => {
    const html = content.target.innerHTML;
    const e = { target: { value: html } }; //emulate event
    if (props && props.setState) props.setState(e, "content");
    setContent(html);
  };
  return (
    <>
      <_Editor
        value={content}
        //tabIndex={1} // tabIndex of textarea
        //config={}
        onBlur={(newContent) => onBlur(newContent)} // preferred to use only this option to update the content for performance reasons
        //onChange={(newContent) => test(newContent)}
      />
    </>
  );
};
export default Editor;
