import { type File } from "../hooks";
import { Upload } from "react-bootstrap-icons";

import styles from "./file-upload.module.scss";
import { useForm } from "react-hook-form";

type FileUploadProps = {
  files: File[]
  getLatest: (id: string) => File
  addFile: (name: string, data: string, assetId?: string) => string
}

const colours = ["#ef476f", "#f78c6b", "#ffd166", "#06d6a0", "#118ab2", "#002147", "#FA9E78", "#FDEBDC", "#6B9A9B"];

const FileUpload = ({ addFile, files, getLatest }: FileUploadProps) => {
  const names = files.map(({ name }) => name).filter((name, i, arr) => arr.indexOf(name) === i);
  const { register, handleSubmit } = useForm<{ file: FileList }>();

  const onSubmit = ({ file }: { file: FileList }) => {
    const name = file[0].name;
    let assetId: string | undefined = undefined;

    if (names.includes(name)) {
      assetId = files.find(file => file.name === name)!.assetId;
    }

    addFile(name, "", assetId);
  };

  return <section
    id={styles["upload"]}>
    <h2>Project Files</h2>
    <ul>
      {names.map((name, i) =>
        <li key={name} style={{ backgroundColor: colours[i % names.length] }}>
          {name}
          <span>v</span>
          {/*@ts-expect-error – readOnly is unknown*/}
          <select value={getLatest(name).version} readOnly={true}
                  style={{ backgroundColor: colours[i % names.length] }}>
            {files.filter(file => file.name === name).map(({ version }) => version).map(version =>
              <option disabled value={version}
                      key={version}>{version}</option>)}
          </select>
        </li>)}
    </ul>
    <form onSubmit={handleSubmit(onSubmit)}>
      <label>New File:</label>
      <div className={styles.file}>
        <input {...register("file")} type="file" />
        <button><Upload /></button>
      </div>
    </form>
  </section>;
};

export default FileUpload;
