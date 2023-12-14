import ace from "ace-builds";
import AceEditor from "react-ace";
import { useStore } from "../../../store";
import { useEffect, useRef, useState } from "react";
import url from "ace-builds/src-noconflict/mode-json";

import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/ext-language_tools";

ace.config.setModuleUrl("ace/mode/json", url);

const ConfigEditor = () => {
  const config = useStore(state => state.config);
  const [data, setData] = useState(config);
  const setConfig = useStore(state => state.setConfig);
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => () => {
    if (dataRef.current === config) return;
    setConfig(dataRef.current);
  }, []);

  return <AceEditor
    placeholder="Section Config"
    mode="json"
    name="custom-config"
    theme="dracula"
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

export default ConfigEditor;
