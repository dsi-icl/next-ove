import ace from "ace-builds";
import { useEffect, useState } from "react";
import AceEditor from "react-ace";
import json from "ace-builds/src-noconflict/mode-json";
import markdown from "ace-builds/src-noconflict/mode-markdown";
import tex from "ace-builds/src-noconflict/mode-tex";

import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/ext-language_tools";

import styles from "./file-upload.module.scss";

ace.config.setModuleUrl("ace/mode/json", json);
ace.config.setModuleUrl("ace/mode/markdown", markdown);
ace.config.setModuleUrl("ace/mode/tex", tex);

export type Language = "markdown" | "json" | "tex"

export type CustomFile = {
  data: string
  language: Language
  name: string
}

type EditorProps = {
  file: CustomFile | null
  save: (file: CustomFile) => void
  close: () => void
}

const Editor = ({ close, file, save }: EditorProps) => {
  const [data, setData] = useState(file?.data ?? "");
  const [name, setName] = useState(file?.name ?? "");
  const [language, setLanguage] = useState<Language>(file?.language ?? "markdown");

  useEffect(() => {
    if (data === file?.data && language === file?.language) return;
    setData("");
  }, [language]);

  const addFileExtension = (name: string) => {
    switch (language) {
      case "markdown":
        return `${name}.md`;
      case "json":
        return `${name}.json`;
      case "tex":
        return `${name}.tex`;
    }
  };

  return <section id={styles["editor"]}>
    <AceEditor
      placeholder="File Contents"
      theme="dracula"
      mode={language}
      name="custom-file"
      style={{ width: "100%", height: "85%" }}
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
    />
    <div className={styles.config}>
      <div className={styles.col}>
        <label htmlFor="language">Language:</label>
        <select id="language" value={language}
                onChange={e => setLanguage((e?.target?.value as Language) ?? "markdown")}>
          <option value="markdown">Markdown</option>
          <option value="json">JSON</option>
          <option value="tex">LaTeX</option>
        </select>
      </div>
      <div className={styles.col}>
        <label htmlFor="name">File Name:</label>
        <input id="name" value={name}
               onChange={e => setName(e?.target?.value)} />
      </div>
      <div className={styles.actions}>
        <button onClick={close}>CLOSE</button>
        <button onClick={() => {
          if (name === "") return;
          save({
            name: addFileExtension(name),
            data: data,
            language: language
          });
        }}>SAVE
        </button>
      </div>
    </div>
  </section>;
};

export default Editor;