import styles from "./file-upload.module.scss";
import { Brush, Upload as UploadButton } from "react-bootstrap-icons";
import { type File as FileT } from "../hooks";
import { type FieldValues } from "react-hook-form";
import { FormEventHandler, useRef } from "react";

type UploadProps = {
  names: string[]
  colors: string[]
  files: FileT[]
  handleSubmit: (onSubmit: (form: {
    file: File[]
  }) => void) => FormEventHandler<HTMLFormElement>
  onSubmit: (form: { file: File[] }) => void
  register: (key: "file") => FieldValues
  setMode: (key: "editor") => void
  getLatest: (id: string) => FileT
  file: File[]
}

const Upload = ({
  names,
  colors,
  files,
  handleSubmit,
  onSubmit,
  register,
  setMode,
  getLatest,
  file
}: UploadProps) => {
  const { ref, ...rest } = register("file");
  const fileRef = useRef<HTMLInputElement | null>(null);

  return <section
    id={styles["upload"]}>
    <h2>Project Files</h2>
    <ul>
      {names.map((name, i) =>
        <li key={name} style={{ backgroundColor: colors[i % names.length] }}>
          {name}
          <span>v</span>
          {/*@ts-expect-error – readOnly is unknown*/}
          <select value={getLatest(name).version} readOnly={true}
                  style={{ backgroundColor: colors[i % names.length] }}>
            {files.filter(file => file.name === name).map(({ version }) => version).map(version =>
              <option disabled value={version}
                      key={version}>{version}</option>)}
          </select>
        </li>)}
    </ul>
    <form onSubmit={handleSubmit(onSubmit)}>
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
               className={styles.selected}>{file?.[0]?.name ?? "No file chosen"}</label>
        <div className={styles.actions}>
          <button onClick={() => setMode("editor")} type="button"><Brush />
          </button>
          <button><UploadButton /></button>
        </div>
      </div>
    </form>
  </section>;
};

export default Upload;