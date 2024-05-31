import ace from "ace-builds";
import AceEditor from "react-ace";
import type { File } from "@ove/ove-types";
import url from "ace-builds/src-noconflict/mode-json";
import React, { useEffect, useRef, useState } from "react";

import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/ext-language_tools";

ace.config.setModuleUrl("ace/mode/json", url);

type EnvEditorProps = {
  env: File
  update: (data: string) => void
  getData: (file: File) => Promise<string>
}

const EnvEditor = ({ env, update, getData }: EnvEditorProps) => {
  const [initial, setInitial] = useState("");
  const [data, setData] = useState(initial);
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    getData(env).then(data => {
      setInitial(data);
      setData(data);
    });

    return () => {
      if (dataRef.current === initial) return;
      update(dataRef.current);
    };
  }, [env, getData, initial, update]);

  return <AceEditor
    placeholder="Environment Config"
    theme="dracula"
    mode="json"
    name="environment-config"
    style={{ width: "100%", height: "100%" }}
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

export default EnvEditor;
