import { actionColors, dataTypes } from "../utils";
import { type File as FileT } from "@ove/ove-types";
import { type FileUploadForm } from "./file-upload";
import { type UseFormRegister } from "react-hook-form";
import React, { FormEventHandler, useRef } from "react";
import { Brush, Upload as UploadButton, X } from "react-bootstrap-icons";

import styles from "./file-upload.module.scss";

type UploadProps = {
  names: string[]
  files: FileT[]
  handleSubmit: (onSubmit: (form: FileUploadForm) => void) =>
    FormEventHandler<HTMLFormElement>
  onSubmit: (form: FileUploadForm) => void
  register: UseFormRegister<FileUploadForm>
  setMode: (key: "editor") => void
  getLatest: (id: string) => FileT
  file: File[]
  closeDialog: () => void
}

const colors = actionColors.concat(dataTypes.map(({ color }) => color));

const Upload = ({
  names,
  files,
  handleSubmit,
  onSubmit,
  register,
  setMode,
  getLatest,
  file,
  closeDialog
}: UploadProps) => {
  const { ref, ...rest } = register("file", { required: true });
  const fileRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  return <section
    id={styles["upload"]}>
    <header>
      <h2>Project Files</h2>
      <button onClick={closeDialog}><X size="1.25rem" /></button>
    </header>
    <ul>
      {names.map((name, i) =>
        <li key={name}
            style={{ backgroundColor: colors[i % names.length] }}>
          {name}
          {/* @ts-expect-error – readOnly is unknown */}
          <select value={getLatest(name).version} readOnly={true}
                  style={{ backgroundColor: colors[i % names.length] }}>
            {files.filter(file =>
              file.name === name).map(({ version }) => version).map(version =>
              <option disabled value={version}
                      key={version}>{version}</option>)}
          </select>
        </li>)}
    </ul>
    <form onSubmit={handleSubmit(onSubmit)} ref={formRef}>
      <label htmlFor="file">New File:</label>
      <div className={styles.file}>
        <input type="file" {...rest} ref={e => {
          ref(e);
          fileRef.current = e;
        }} style={{ display: "none" }} />
        <button className={styles.browse} type="button"
                onClick={() => fileRef?.current?.click()}>Browse...
        </button>
        <label htmlFor="file"
               className={styles.selected}>
          {file?.[0]?.name ?? "No file chosen"}
        </label>
        <div className={styles.actions}>
          <button onClick={() => setMode("editor")} type="button"><Brush />
          </button>
          <button type="submit"><UploadButton /></button>
        </div>
      </div>
    </form>
  </section>;
};

export default Upload;
