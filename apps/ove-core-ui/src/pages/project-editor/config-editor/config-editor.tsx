import ace from "ace-builds";
import AceEditor from "react-ace";
import { useStore } from "../../../store";
import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/ext-language_tools";
import url from "ace-builds/src-noconflict/mode-json";

import styles from "./config-editor.module.scss";

ace.config.setModuleUrl("ace/mode/json", url);

const ConfigEditor = ({closeDialog}: {closeDialog: () => void}) => {
  const config = useStore(state => state.config);
  const setConfig = useStore(state => state.setConfig);

  return <section id={styles["config"]}>
    <h2>Custom Config</h2>
    <AceEditor
      placeholder="Placeholder Text"
      mode="json"
      name="custom-config"
      className={styles.editor}
      onChange={setConfig}
      fontSize={14}
      showPrintMargin={true}
      showGutter={true}
      highlightActiveLine={false}
      value={config}
      setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: false,
        enableSnippets: false,
        showLineNumbers: true,
        tabSize: 2,
        useWorker: false
      }}
    />
    <button onClick={closeDialog}>CLOSE</button>
  </section>;
};

export default ConfigEditor;
