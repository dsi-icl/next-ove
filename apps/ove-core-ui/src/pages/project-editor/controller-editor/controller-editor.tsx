import ace from "ace-builds";
import AceEditor from "react-ace";
import { useEffect, useRef, useState } from "react";
import url from "ace-builds/src-noconflict/mode-html";

import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/ext-language_tools";

ace.config.setModuleUrl("ace/mode/json", url);

type ControllerEditorProps = {
  controller: string
  update: (data: string) => void
}

const ControllerEditor = ({ controller, update }: ControllerEditorProps) => {
  const [data, setData] = useState(controller);
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => () => {
    if (dataRef.current === controller) return;
    update(dataRef.current);
  }, []);

  return <AceEditor
    placeholder="Controller"
    theme="dracula"
    mode="html"
    name="custom-config"
    style={{ width: "100%" }}
    onChange={setData}
    fontSize={14}
    showPrintMargin={true}
    showGutter={true}
    highlightActiveLine={false}
    value={data}
    setOptions={{
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: false,
      enableSnippets: false,
      showLineNumbers: true,
      tabSize: 2,
      useWorker: false
    }}
  />;
};

export default ControllerEditor;
