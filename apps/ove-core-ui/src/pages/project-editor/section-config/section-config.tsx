import { type Actions, type File } from "../hooks";
import { useForm } from "react-hook-form";
import { useStore } from "../../../store";
import { useEffect, useState } from "react";
import { type Section } from "@prisma/client";
import { DataType, type Geometry, type Space } from "../types";
import { Grid, Brush, Fullscreen } from "react-bootstrap-icons";
import S3FileSelect from "../../../components/s3-file-select/s3-file-select";

import styles from "./section-config.module.scss";
import { dataTypes } from "../utils";

type SectionConfigProps = {
  sections: Section[]
  selected: string | null
  updateSection: (section: Omit<Section, "id">) => void
  space: Space & { cells: Geometry[] }
  projectId: string
  state: string
  setAction: (action: Actions | null) => void
  files: File[]
  fromURL: (url: string | null) => File | null
  toURL: (name: string, version: number) => string
  getLatest: (id: string) => File
}

type SectionConfigForm = Omit<Section, "id"> & {
  rowFrom: number | null,
  columnFrom: number | null
  rowTo: number | null
  columnTo: number | null
  fileName: string | null
  fileVersion: string | null
}

const getDataTypeFromFile = (file: File) => {
  for (const dt of dataTypes) {
    if (dt.extensions.some(extension => file.name.toUpperCase().endsWith(extension))) return dt.name;
  }
  return null;
};

const sort = (k: keyof DataType, a: DataType, b: DataType) => {
  if (a[k] > b[k]) return 1;
  if (a[k] === b[k]) return 0;
  return -1;
};

const SectionConfig = ({
  sections,
  selected,
  updateSection,
  space,
  projectId,
  state,
  setAction,
  files,
  fromURL,
  toURL,
  getLatest
}: SectionConfigProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    resetField,
    watch
  } = useForm<SectionConfigForm>();
  const [mode, setMode] = useState<"custom" | "grid">("custom");
  const config = useStore(state => state.config);
  const [fileName, fileVersion] = watch(["fileName", "fileVersion"]);

  const toPercentage = (x: number) => parseFloat(`${(x * 100)}`.slice(0, 5));
  const fromPercentage = (x: number) => parseFloat(x.toString()) / 100;

  const getRow = (y: number) => {
    if (y === 0) return 0;
    if (y === 1) return space.rows;
    for (let i = 0; i < space.cells.length; i++) {
      if (space.cells[i].y === y * space.height) return Math.floor(i / space.columns);
    }

    return null;
  };

  const getColumn = (x: number) => {
    if (x === 0) return 0;
    if (x === 1) return space.columns;
    for (let i = 0; i < space.cells.length; i++) {
      if (space.cells[i].x === x * space.width) return i % space.columns;
    }

    return null;
  };

  useEffect(() => {
    setValue("config", formatConfig(config));
  }, [config]);

  useEffect(() => {
    if (selected === null) {
      resetField("x");
      resetField("y");
      resetField("width");
      resetField("height");
      resetField("rowFrom");
      resetField("columnFrom");
      resetField("rowTo");
      resetField("columnTo");
      resetField("asset");
      setValue("fileName", "-- select an option --");
      setValue("fileVersion", "-- select an option --");
      setValue("dataType", "-- select an option --");
      return;
    }

    const section = sections.find(section => section.id === selected)!;
    const rowFrom = getRow(section.y);
    const colFrom = getColumn(section.x);
    const rowTo = getRow(section.y + section.height);
    const colTo = getColumn(section.x + section.width);
    setValue("x", toPercentage(section.x));
    setValue("y", toPercentage(section.y));
    setValue("width", toPercentage(section.width));
    setValue("height", toPercentage(section.height));
    setValue("rowFrom", rowFrom);
    setValue("columnFrom", colFrom);
    setValue("rowTo", rowTo);
    setValue("columnTo", colTo);
    setValue("dataType", section.dataType);
    setValue("asset", section.asset);
    const file = fromURL(section.asset);
    if (file !== null) {
      setValue("fileName", file.name);
      setValue("fileVersion", file.version.toString());
    }
  }, [selected, sections]);

  const onSubmit = (section: SectionConfigForm) => {
    updateSection({
      x: mode === "custom" ? fromPercentage(section.x) : section.columnFrom! / space.columns,
      y: mode === "custom" ? fromPercentage(section.y) : section.rowFrom! / space.rows,
      width: mode === "custom" ? fromPercentage(section.width) : (section.columnTo! - section.columnFrom!) * (1 / space.columns),
      height: mode === "custom" ? fromPercentage(section.height) : (section.rowTo! - section.rowFrom!) * (1 / space.rows),
      config: JSON.parse(config),
      assetId: files.find(({
        name,
        version
      }) => name === section.fileName && version.toString() === section.fileVersion)?.assetId ?? null,
      asset: section.asset,
      dataType: section.dataType,
      states: [state],
      ordering: section.ordering ?? sections.length,
      projectId: projectId
    });
  };

  const formatConfig = (config: string) => {
    const stripped = config.split("\n").map(x => x.trim()).join("");
    return stripped.length < 20 ? stripped : `${stripped.slice(0, 20)}...`;
  };

  const fullscreen = () => {
    setValue("x", 0);
    setValue("y", 0);
    setValue("width", 100);
    setValue("height", 100);
    setValue("columnFrom", 0);
    setValue("columnTo", space.columns);
    setValue("rowFrom", 0);
    setValue("rowTo", space.rows);
  };

  const onAssetChange = (asset: string) => {
    const file = fromURL(asset ?? "");
    setValue("fileName", file?.name ?? null);
    setValue("fileVersion", file?.version?.toString() ?? null);
    if (file !== null) {
      setValue("dataType", getDataTypeFromFile(file) ?? "-- select an option --");
    }
  };

  useEffect(() => {
    if (fileName !== null && fileName !== undefined && fileName !== "-- select an option --" && fileVersion !== null && fileVersion !== undefined && fileVersion !== "-- select an option --") {
      setValue("asset", toURL(fileName, parseInt(fileVersion)));
      const file = files.find(({
        name,
        version
      }) => name === fileName && version === parseInt(fileVersion))!;
      setValue("dataType", getDataTypeFromFile(file) ?? "-- select an option --");
    }
  }, [fileName, fileVersion]);

  return <section id={styles["section-config"]}>
    <h2>Section Config</h2>
    <form onSubmit={handleSubmit(onSubmit)}>
      <div id={styles["geometry"]}>
        <div className={styles.actions}>
          <div className={styles.mode}>
            <button className={styles.action} type="button"
                    onClick={() => setMode("custom")}
                    style={{ backgroundColor: mode === "custom" ? "#dadedf" : undefined }}>
              <Brush color="black" /></button>
            <button className={styles.action} type="button"
                    onClick={() => setMode("grid")}
                    style={{ backgroundColor: mode === "grid" ? "#dadedf" : undefined }}>
              <Grid color="black" /></button>
          </div>
          <button className={styles.action} id={styles["fullscreen"]}
                  type="button" onClick={fullscreen}><Fullscreen /></button>
        </div>
        <fieldset style={mode === "custom" ? undefined : { display: "none" }}>
          <div className={styles.column}>
            <label htmlFor="x">x:</label>
            <div className={styles["percentage-container"]}>
              <input {...register("x")} />
              <span className={styles.percentage}>%</span>
            </div>
          </div>
          <div className={styles.column}>
            <label htmlFor="y">y:</label>
            <div className={styles["percentage-container"]}>
              <input {...register("y")} />
              <span className={styles.percentage}>%</span>
            </div>
          </div>
          <div className={styles.column}>
            <label htmlFor="width">Width:</label>
            <div className={styles["percentage-container"]}>
              <input {...register("width")} />
              <span className={styles.percentage}>%</span>
            </div>
          </div>
          <div className={styles.column}>
            <label htmlFor="height">Height:</label>
            <div className={styles["percentage-container"]}>
              <input {...register("height")} />
              <span className={styles.percentage}>%</span>
            </div>
          </div>
        </fieldset>
        <fieldset style={mode === "grid" ? undefined : { display: "none" }}>
          <div className={styles.column}>
            <label htmlFor="rowFrom">Row:</label>
            <input {...register("rowFrom")} placeholder="From:" />
          </div>
          <div className={styles.column}>
            <input className={styles.to} {...register("rowTo")}
                   placeholder="To:" />
          </div>
          <div className={styles.column}>
            <label htmlFor="columnFrom">Column:</label>
            <input {...register("columnFrom")} placeholder="From:" />
          </div>
          <div className={styles.column}>
            <input className={styles.to} {...register("columnTo")}
                   placeholder="To:" />
          </div>
        </fieldset>
      </div>
      <fieldset>
        <label htmlFor="asset">Asset:</label>
        <input {...register("asset", { onChange: e => onAssetChange(e?.target?.value) })} />
        <S3FileSelect register={register} watch={watch} fromURL={fromURL}
                      getLatest={getLatest} setValue={setValue}
                      files={files} url={watch("asset")} />
        <label htmlFor="dataType" className={styles["data-type-label"]}>Data
          Type:</label>
        <select {...register("dataType")}>
          <option value="-- select an option --">-- select an option --</option>
          {dataTypes.sort((a, b) => sort("displayName", a, b)).map(({
            displayName,
            name
          }) => <option key={name} value={name}>{displayName}</option>)}
        </select>
        <label htmlFor="config">Config:</label>
        <input className={styles.config} {...register("config")} type="button"
               onClick={() => setAction("custom-config")} />
      </fieldset>
      <button className={styles.submit} type="submit" />
    </form>
  </section>;
};

export default SectionConfig;
