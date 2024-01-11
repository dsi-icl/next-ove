import ace from "ace-builds";
import AceEditor from "react-ace";
import { type File } from "@ove/ove-types";
import React, { useEffect, useRef, useState } from "react";
import url from "ace-builds/src-noconflict/mode-html";

import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/ext-language_tools";

ace.config.setModuleUrl("ace/mode/json", url);

type ControllerEditorProps = {
  controller: File
  update: (data: string) => void
  getData: (file: File) => Promise<string>
}

const ControllerEditor = ({
  controller,
  getData,
  update
}: ControllerEditorProps) => {
  const [initial, setInitial] = useState("");
  const [data, setData] = useState(initial);
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    getData(controller).then(data => {
      setInitial(data);
      setData(data);
    });

    return () => {
      if (dataRef.current === initial) return;
      update(dataRef.current);
    };
  }, [controller, getData, initial, update]);

  return <AceEditor
    placeholder="Controller"
    theme="dracula"
    mode="html"
    name="controller-config"
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
