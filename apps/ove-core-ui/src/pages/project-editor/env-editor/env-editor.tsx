import AceEditor from "react-ace";
import { useEffect, useRef, useState } from "react";

type EnvEditorProps = {
  env: string
  update: (data: string) => void
}

const EnvEditor = ({ env, update }: EnvEditorProps) => {
  const [data, setData] = useState(env);
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => () => {
    if (dataRef.current === env) return;
    update(dataRef.current);
  }, []);

  return <AceEditor
    placeholder="Environment Config"
    theme="dracula"
    mode="json"
    name="environment-config"
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

export default EnvEditor;
