import { File } from "@ove/ove-types";
import FileManager from "./file-manager";
import { useData } from "../hooks/files";
import FileEditor, { type Language } from "./file-editor";
import React, { useCallback, useMemo, useState } from "react";

const FileEditorContainer = ({file, close}: {file: File | null, close: () => void}) => {
  const language = useMemo(() => (file?.name?.split(".")?.at(-1) ?? "markdown") as Language, [file?.name]);
  const data = useData(file ?? {bucketName: "ERROR", name: "ERROR", isGlobal: false, isLatest: false, version: "ERROR"});

  return data !== null ? <FileEditor file={{data, language}} close={close} /> : null;
};

const Files = () => {
  const [mode, setMode] = useState<"manager" | "editor">("manager");
  const [file, setFile] = useState<File | null>(null);
  const edit = useCallback((file: File | null) => {
    setMode("editor");
    setFile(file);
  }, [setMode, setFile]);

  return mode === "manager" ? <FileManager edit={edit} /> : <FileEditorContainer file={file} close={() => setMode("manager")} />;
};

export default Files;
