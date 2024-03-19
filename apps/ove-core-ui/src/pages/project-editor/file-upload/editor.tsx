import ace from "ace-builds";
import AceEditor from "react-ace";
import React, { useEffect, useState } from "react";
import { Button } from "@ove/ui-base-components";
import json from "ace-builds/src-noconflict/mode-json";
import markdown from "ace-builds/src-noconflict/mode-markdown";
import tex from "ace-builds/src-noconflict/mode-tex";
import html from "ace-builds/src-noconflict/mode-html";
import text from "ace-builds/src-noconflict/mode-text";
import css from "ace-builds/src-noconflict/mode-css";
import svg from "ace-builds/src-noconflict/mode-svg";

import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/ext-language_tools";

import styles from "./file-upload.module.scss";

ace.config.setModuleUrl("ace/mode/json", json);
ace.config.setModuleUrl("ace/mode/markdown", markdown);
ace.config.setModuleUrl("ace/mode/tex", tex);
ace.config.setModuleUrl("ace/mode/html", html);
ace.config.setModuleUrl("ace/mode/text", text);
ace.config.setModuleUrl("ace/mode/css", css);
ace.config.setModuleUrl("ace/mode/svg", svg);

export type Language = "markdown" | "json" | "latex" | "css" | "csv" | "html"

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

const getExtensionForLanguage = (language: string) => {
  if (language === "latex") return ".tex";
  if (language === "markdown") return ".md";
  return `.${language}`;
};

const Editor = ({ close, file, save }: EditorProps) => {
  const [data, setData] = useState(file?.data ?? "");
  const [name, setName] = useState(file?.name ?? "");
  const [language, setLanguage] =
    useState<Language>(file?.language ?? "markdown");

  const languageToMode = (language: Language) =>
    language === "csv" ? "text" : language;

  useEffect(() => {
    if (data === file?.data && language === file?.language) return;
    setData("");
  }, [language, data, file?.data, file?.language]);

  const addFileExtension = (name: string) => {
    const extension = getExtensionForLanguage(language);
    return `${name}${extension}`;
  };

  return <section id={styles["editor"]}>
    <AceEditor
      placeholder="File Contents"
      theme="dracula"
      mode={languageToMode(language)}
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
                onChange={e =>
                  setLanguage((e?.target?.value as Language) ?? "markdown")}>
          <option value="css">CSS</option>
          <option value="csv">Data Table (CSV)</option>
          <option value="html">HTML</option>
          <option value="markdown">Markdown</option>
          <option value="json">JSON</option>
          <option value="latex">LaTeX</option>
          <option value="svg">SVG</option>
        </select>
      </div>
      <div className={styles.col}>
        <label htmlFor="name">File Name:</label>
        <input id="name" value={name}
               onChange={e => setName(e?.target?.value)} />
      </div>
      <div className={styles.actions}>
        <Button variant="outline" onClick={close}>CLOSE</Button>
        <Button variant="default" onClick={() => {
          if (name === "") return;
          save({
            name: addFileExtension(name),
            data: data,
            language: language
          });
        }}>SAVE
        </Button>
      </div>
    </div>
  </section>;
};

export default Editor;
