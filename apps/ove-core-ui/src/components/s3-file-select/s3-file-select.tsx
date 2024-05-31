import type { File } from "@ove/ove-types";
import type { FieldValues } from "react-hook-form";
import React, { type BaseSyntheticEvent } from "react";

import styles from "./s3-file-select.module.scss";

type S3FileSelectProps = {
  id?: string
  disabled?: boolean
  register: (id: "fileName" | "fileVersion", args?: {
    onChange: (event: BaseSyntheticEvent<object> | undefined) => void
  }) => FieldValues,
  files: File[]
  watch: (value: string) => string
}

const S3FileSelect = ({
  id,
  disabled,
  files,
  register,
  watch,
}: S3FileSelectProps) => {
  const name = watch("fileName");

  return <div id={id}>
    <div id={styles["container"]}>
      <label htmlFor="fileName">File Name</label>
      <select
        disabled={disabled ?? false}
        className={styles.name} {...register("fileName")}>
        <option disabled value={"-- select an option --"}> -- select an option
          --
        </option>
        {files
          .map(({ bucketName, name }) => `${bucketName}/${name}`)
          .filter((name, i, arr) => arr.indexOf(name) === i)
          .map(name =>
            <option key={name} value={name}>{name}</option>)}
      </select>
      <label htmlFor="fileVersion">File Version</label>
      <select
        disabled={disabled ?? false}
        className={styles.version} {...register("fileVersion")}>
        <option disabled value="-- select an option --"> -- select an option --
        </option>
        {files.filter(file => `${file.bucketName}/${file.name}` === name)
          .map(({ version }) => version)
          .map(version =>
            <option key={version}
                    value={version}>{version}</option>)}
      </select>
    </div>
  </div>;
};

export default S3FileSelect;
