import { z } from "zod";
import { assert } from "@ove/ove-utils";
import { dataTypes } from "../utils";
import { type Actions } from "../hooks";
import { type File } from "@ove/ove-types";
import {
  type DataType,
  type Geometry as TGeometry,
  type Space
} from "../types";
import {
  useForm,
  type UseFormRegister,
  type UseFormSetValue
} from "react-hook-form";
import { useStore } from "../../../store";
import { type Section } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Grid, Brush, Fullscreen } from "react-bootstrap-icons";
import S3FileSelect from "../../../components/s3-file-select/s3-file-select";

import styles from "./section-config.module.scss";

type SectionConfigProps = {
  sections: Section[]
  selected: string | null
  updateSection: (section: Omit<Section, "id">) => void
  space: Space & { cells: TGeometry[] }
  projectId: string
  state: string
  setAction: (action: Actions | null) => void
  files: File[]
  fromURL: (url: string | null) => File | null
  toURL: (name: string, version: number) => string
  getLatest: (id: string) => File
}

const getDataTypeFromFile = (file: File) => {
  for (const dt of dataTypes) {
    if (dt.extensions.some(extension =>
      file.name.toUpperCase().endsWith(extension))) {
      return dt.name;
    }
  }
  return null;
};

const sort = (k: keyof DataType, a: DataType, b: DataType) => {
  if (a[k] > b[k]) return 1;
  if (a[k] === b[k]) return 0;
  return -1;
};

const toPercentage = (x: number) => parseFloat(`${(x * 100)}`.slice(0, 5));
const fromPercentage = (x: number) => parseFloat(x.toString()) / 100;

const getRow = (y: number, space: Space & { cells: TGeometry[] }) => {
  if (y === 0) return 0;
  if (y === 1) return space.rows;
  for (let i = 0; i < space.cells.length; i++) {
    if (space.cells[i].y === y * space.height) {
      return Math.floor(i / space.columns);
    }
  }

  return null;
};

const getColumn = (x: number, space: Space & { cells: TGeometry[] }) => {
  if (x === 0) return 0;
  if (x === 1) return space.columns;
  for (let i = 0; i < space.cells.length; i++) {
    if (space.cells[i].x === x * space.width) return i % space.columns;
  }

  return null;
};

const formatConfig = (config: string) => {
  const stripped = config.split("\n").map(x => x.trim()).join("");
  return stripped.length < 20 ? stripped : `${stripped.slice(0, 20)}...`;
};

const SectionConfigSchema = z.strictObject({
  width: z.number().nullable(),
  height: z.number().nullable(),
  x: z.number().nullable(),
  y: z.number().nullable(),
  config: z.string().nullable(),
  fileName: z.string().nullable(),
  fileVersion: z.string().nullable(),
  rowFrom: z.number().nullable(),
  rowTo: z.number().nullable(),
  columnFrom: z.number().nullable(),
  columnTo: z.number().nullable(),
  dataType: z.string(),
  asset: z.string()
});

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
  } = useForm<z.infer<typeof SectionConfigSchema>>(
    { resolver: zodResolver(SectionConfigSchema) });
  const [mode, setMode] = useState<"custom" | "grid">("custom");
  const config = useStore(state => state.config);
  const [fileName, fileVersion] = watch(["fileName", "fileVersion"]);

  useEffect(() => {
    setValue("config", formatConfig(config));
  }, [config, setValue]);

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

    const section = assert(sections
      .find(section => section.id === selected));
    const rowFrom = getRow(section.y, space);
    const colFrom = getColumn(section.x, space);
    const rowTo = getRow(section.y + section.height, space);
    const colTo = getColumn(section.x + section.width, space);
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
  }, [selected, sections, fromURL, resetField, setValue, space]);

  const onSubmit = (section: z.infer<typeof SectionConfigSchema>) => {
    updateSection({
      x: mode === "custom" ? fromPercentage(assert(section.x)) :
        assert(section.columnFrom) / space.columns,
      y: mode === "custom" ? fromPercentage(assert(section.y)) :
        assert(section.rowFrom) / space.rows,
      width: mode === "custom" ? fromPercentage(assert(section.width)) :
        (assert(section.columnTo) - assert(
          section.columnFrom)) * (1 / space.columns),
      height: mode === "custom" ? fromPercentage(assert(section.height)) :
        (assert(section.rowTo) - assert(section.rowFrom)) * (1 / space.rows),
      config: JSON.parse(config),
      assetId: files.find(({
        name,
        version
      }) => name === section.fileName &&
        version.toString() === section.fileVersion)?.assetId ?? null,
      asset: section.asset,
      dataType: section.dataType,
      states: [state],
      ordering: sections.find(section =>
        section.id === selected)?.ordering ?? sections.length,
      projectId: projectId
    });
  };

  const onAssetChange = (asset: string) => {
    const file = fromURL(asset ?? "");
    setValue("fileName", file?.name ?? null);
    setValue("fileVersion", file?.version?.toString() ?? null);
    if (file !== null) {
      setValue("dataType", getDataTypeFromFile(file) ??
        "-- select an option --");
    }
  };

  useEffect(() => {
    if (fileName !== null && fileName !== undefined &&
      fileName !== "-- select an option --" && fileVersion !== null &&
      fileVersion !== undefined && fileVersion !== "-- select an option --") {
      setValue("asset", toURL(fileName, parseInt(fileVersion)));
      const file = assert(files.find(({
        name,
        version
      }) => name === fileName && version === parseInt(fileVersion)));
      setValue("dataType", getDataTypeFromFile(file) ??
        "-- select an option --");
    }
  }, [fileName, fileVersion, files, setValue, toURL]);

  return <section id={styles["section-config"]}>
    <h2>Section Config</h2>
    <form onSubmit={handleSubmit(onSubmit)}>
      <div id={styles["left-container"]}>
        <Geometry setMode={setMode} mode={mode} space={space}
                  setValue={setValue} register={register} />
        <div id={styles["config-container"]}>
          <label htmlFor="config">Config:</label>
          <input className={styles.config} {...register("config")} type="button"
                 onClick={() => setAction("custom-config")} />
        </div>
      </div>
      <fieldset id={styles["assets"]}>
        <label htmlFor="asset">Asset:</label>
        <input {...register("asset", {
          onChange: e =>
            onAssetChange(e?.target?.value)
        })} />
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
        <div id={styles["submit-container"]}>
          <button className={styles.submit} type="submit">UPDATE</button>
        </div>
      </fieldset>
    </form>
  </section>;
};

const Geometry = ({ mode, register, setMode, setValue, space }: {
  mode: "custom" | "grid",
  register: UseFormRegister<z.infer<typeof SectionConfigSchema>>,
  setMode: (mode: "custom" | "grid") => void,
  setValue: UseFormSetValue<z.infer<typeof SectionConfigSchema>>,
  space: Space
}) => {
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

  const backgroundColor = mode === "custom" ? "#dadedf" : undefined;

  return <div id={styles["geometry"]}>
    <div className={styles.actions}>
      <div className={styles.mode}>
        <button className={styles.action} type="button"
                onClick={() => setMode("custom")}
                style={{ backgroundColor }}>
          <Brush color="black" /></button>
        <button className={styles.action} type="button"
                onClick={() => setMode("grid")}
                style={{ backgroundColor }}>
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
  </div>;
};

export default SectionConfig;
