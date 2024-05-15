import { z } from "zod";
import Upload from "./upload";
import { useForm } from "react-hook-form";
import { type File as FileT } from "@ove/ove-types";
import Editor, { type CustomFile } from "./editor";
import React, { type CSSProperties, useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

type FileUploadProps = {
  files: FileT[]
  getLatest: (id: string) => FileT
  addFile: (name: string, data: string) => void
  setDialogStyle: (style: CSSProperties | undefined) => void
  closeDialog: () => void
}

export const FileUploadFormSchema = z.strictObject({
  file: z.custom<File>().array()
});

export type FileUploadForm = z.infer<typeof FileUploadFormSchema>

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
  const { register, handleSubmit, resetField, watch } =
    useForm<FileUploadForm>({
      resolver: zodResolver(FileUploadFormSchema)
    });
  const file = watch("file");

  useEffect(() => {
    setDialogStyle({ padding: mode === "upload" ? "2rem" : "0" });
  }, [mode, setDialogStyle]);

  useEffect(() => {
    setCustomFile(null);
  }, [file]);

  const onSubmit = ({ file }: FileUploadForm) => {
    const name = convertCustomFile(customFile)?.[0]?.name ?? file[0].name;
    addFile(name, "");
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
