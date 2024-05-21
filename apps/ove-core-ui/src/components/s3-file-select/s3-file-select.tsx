import { type FieldValues } from "react-hook-form";
import React, { type BaseSyntheticEvent, useEffect } from "react";
import { type File } from "@ove/ove-types";

import styles from "./s3-file-select.module.scss";

type S3FileSelectProps = {
  id?: string
  disabled?: boolean
  register: (id: "fileName" | "fileVersion", args?: {
    onChange: (event: BaseSyntheticEvent<object> | undefined) => void
  }) => FieldValues,
  files: File[]
  setValue: (key: "fileName" | "fileVersion", value: string) => void
  watch: (value: string) => string
  fromURL: (url: string | null) => File | null
  getLatest: (name: string) => File
  url: string
}

const S3FileSelect = ({
  id,
  disabled,
  files,
  register,
  setValue,
  watch,
  url,
  fromURL,
  getLatest
}: S3FileSelectProps) => {
  const name = watch("fileName");

  useEffect(() => {
    if (name === null || name === undefined ||
      name === "-- select an option --") return;
    const file = fromURL(url ?? null);
    if (file !== null && file.name === name) {
      setValue("fileVersion", file.version.toString());
    } else {
      setValue("fileVersion", getLatest(name).version);
    }
  }, [fromURL, setValue, url, name]);

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
          .map(({ name }) => name)
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
        {files.filter(file => file.name === name)
          .map(({ version }) => version)
          .map(version =>
            <option key={version}
                    value={version}>{version}</option>)}
      </select>
    </div>
  </div>;
};

export default S3FileSelect;
