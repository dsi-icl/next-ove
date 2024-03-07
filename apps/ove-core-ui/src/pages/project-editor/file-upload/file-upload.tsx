import Upload from "./upload";
import { assert } from "@ove/ove-utils";
import { useForm } from "react-hook-form";
import { type File as FileT } from "@ove/ove-types";
import Editor, { type CustomFile } from "./editor";
import React, { type CSSProperties, useState, useEffect } from "react";

type FileUploadProps = {
  files: FileT[]
  getLatest: (id: string) => FileT
  addFile: (name: string, data: string, assetId?: string) => void
  setDialogStyle: (style: CSSProperties | undefined) => void
  closeDialog: () => void
}

const FileUpload = ({
  addFile,
  files,
  getLatest,
  setDialogStyle,
  closeDialog
}: FileUploadProps) => {
  const [mode, setMode] = useState<"upload" | "editor">("upload");
  const names = files.map(({ name }) => name)
    .filter((name, i, arr) => arr.indexOf(name) === i);
  const [customFile, setCustomFile] = useState<CustomFile | null>(null);
  const { register, handleSubmit, resetField, watch } = useForm<{
    file: File[]
  }>();
  const file = watch("file");

  useEffect(() => {
    setDialogStyle({ padding: mode === "upload" ? "2rem" : "0" });
  }, [mode, setDialogStyle]);

  useEffect(() => {
    setCustomFile(null);
  }, [file]);

  const onSubmit = ({ file }: { file: File[] }) => {
    const name = convertCustomFile(customFile)?.[0]?.name ?? file[0].name;
    let assetId: string | undefined = undefined;

    if (names.includes(name)) {
      assetId = assert(files.find(file => file.name === name)).assetId;
    }

    addFile(name, "", assetId);
    resetField("file");
  };

  const saveCustomFile = (file: CustomFile) => {
    setCustomFile(file);
    setMode("upload");
  };

  const convertCustomFile = (customFile: CustomFile | null) => {
    if (customFile === null) return;
    return [new File(
      customFile.data.split("\n"),
      customFile.name,
      { type: "text/plain" }
    )];
  };

  return mode === "upload" ?
    <Upload file={convertCustomFile(customFile) ?? file} getLatest={getLatest}
            names={names} files={files} onSubmit={onSubmit}
            handleSubmit={handleSubmit} setMode={setMode}
            register={register} closeDialog={closeDialog} /> :
    <Editor file={customFile} save={saveCustomFile}
            close={() => setMode("upload")} />;
};

export default FileUpload;
