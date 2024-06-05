import { z } from "zod";
import Upload from "./upload";
import { useForm } from "react-hook-form";
import Editor, { type CustomFile } from "./editor";
import type { File as FileT } from "@ove/ove-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormErrorHandling } from "@ove/ui-components";
import React, { type CSSProperties, useState, useEffect } from "react";

type FileUploadProps = {
  files: FileT[]
  getLatest: (bucketName: string, name: string) => FileT
  uploadFile: (name: string, file: File) => void
  setDialogStyle: (style: CSSProperties | undefined) => void
  closeDialog: () => void
}

export const FileUploadFormSchema = z.strictObject({
  file: z.union([z.custom<File>().array(), z.custom<File>()])
});

export type FileUploadForm = z.infer<typeof FileUploadFormSchema>

const FileUpload = ({
  uploadFile,
  files,
  getLatest,
  setDialogStyle,
  closeDialog
}: FileUploadProps) => {
  const [mode, setMode] = useState<"upload" | "editor">("upload");
  const names = files.map(({ bucketName, name }) => `${bucketName}/${name}`)
    .filter((name, i, arr) => arr.indexOf(name) === i);
  const [customFile, setCustomFile] = useState<CustomFile | null>(null);
  const { register, formState: { errors }, handleSubmit, resetField, watch } =
    useForm<FileUploadForm>({
      resolver: zodResolver(FileUploadFormSchema)
    });
  const file = watch("file");
  useFormErrorHandling(errors);

  useEffect(() => {
    setDialogStyle({ padding: mode === "upload" ? "2rem" : "0" });
  }, [mode, setDialogStyle]);

  useEffect(() => {
    setCustomFile(null);
  }, [file]);

  const onSubmit = ({ file }: FileUploadForm) => {
    if (customFile !== null) {
      uploadFile(customFile.name, new File([customFile.data],
        customFile.name, { type: "text/plain" }));
    } else {
      uploadFile(("length" in file ? file[0] : file).name,
        "length" in file ? file[0] : file);
    }
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
    <Upload file={convertCustomFile(customFile) ?? (file !== undefined &&
    "length" in file ? file : [file])} getLatest={getLatest}
            names={names} files={files} onSubmit={onSubmit}
            handleSubmit={handleSubmit} setMode={setMode}
            register={register} closeDialog={closeDialog} /> :
    <Editor file={customFile} save={saveCustomFile}
            close={() => setMode("upload")} />;
};

export default FileUpload;
