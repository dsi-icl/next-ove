import { type FieldValues } from "react-hook-form";

import styles from "./s3-file-select.module.scss";
import { BaseSyntheticEvent, useState } from "react";

const S3FileSelect = <T extends string, >({
  ids,
  files,
  register,
  resetField,
  defaultFile
}: {
  register: (id: T, args?: {
    onChange: (event: BaseSyntheticEvent<object> | undefined) => void
  }) => FieldValues,
  ids: [T, T],
  files: { name: string, version: number }[]
  resetField: () => void
  defaultFile: string | null
}) => {
  const [selected, setSelected] = useState<string | null>(defaultFile);

  const versions = selected === null ?
    [] :
    files.filter(({ name }) => name === selected).map(({ version }) => version);

  const onNameChange = (name: string | undefined) => {
    if (name === undefined) return;
    resetField();
    setSelected(name);
  };

  return <div id={styles["container"]}>
    <label htmlFor={ids[0]}>{ids[0]}</label>
    <select {...register(ids[0], { onChange: e => onNameChange(e?.target?.value) })}>
      {files.map(({ name }) => name).filter((name, i, arr) => arr.indexOf(name) === i).map(name =>
        <option key={name} value={name}>{name}</option>)}
    </select>
    <label htmlFor={ids[1]}>{ids[1]}</label>
    <select {...register(ids[1])}>
      {versions.map(version =>
        <option key={version}
                value={version}>{version}</option>)}
    </select>
  </div>;
};

export default S3FileSelect;
