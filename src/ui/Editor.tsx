import React from "react";
import ReactMde from "react-mde";
import ReactMarkdown from "react-markdown";

type EditorProps = {
  setState: Function;
};
function Editor(props: EditorProps) {
  const [value, setValue] = React.useState("Напишите здесь текст новости");
  const [selectedTab, setSelectedTab] = React.useState("write");
  const onChange = (text) => {
    const e = {
      target: { value: text },
    };
    props.setState(e, "content"); //e is "event" (duck typing)
    setValue(text);
  };
  const save = async function* (data) {
    // Promise that waits for "time" milliseconds
    const wait = function (time) {
      return new Promise((a, r) => {
        setTimeout(() => a(), time);
      });
    };

    // Upload "data" to your server
    // Use XMLHttpRequest.send to send a FormData object containing
    // "data"
    // Check this question: https://stackoverflow.com/questions/18055422/how-to-receive-php-image-data-over-copy-n-paste-javascript-with-xmlhttprequest

    await wait(2000);
    // yields the URL that should be inserted in the markdown
    yield "https://picsum.photos/300";
    await wait(2000);

    // returns true meaning that the save was successful
    return true;
  };

  //NOTE: we can use loadSuggestions below
  return (
    <ReactMde
      value={value}
      onChange={onChange}
      selectedTab={selectedTab as "write"}
      onTabChange={setSelectedTab}
      generateMarkdownPreview={(markdown) =>
        Promise.resolve(<ReactMarkdown source={markdown} />)
      }
      childProps={{
        writeButton: {
          tabIndex: -1,
        },
      }}
      paste={{
        saveImage: save,
      }}
    />
  );
}
export default Editor;
