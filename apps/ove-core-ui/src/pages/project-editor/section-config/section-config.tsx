import { type Actions, type File } from "../hooks";
import { useForm } from "react-hook-form";
import { useStore } from "../../../store";
import { useEffect, useState } from "react";
import { type Section } from "@prisma/client";
import { type Geometry, type Space } from "../types";
import { Grid, Brush, Fullscreen } from "react-bootstrap-icons";
import S3FileSelect from "../../../components/s3-file-select/s3-file-select";

import styles from "./section-config.module.scss";

type SectionConfigProps = {
  sections: Section[]
  selected: string | null
  updateSection: (section: Omit<Section, "id">) => void
  space: Space & { cells: Geometry[] }
  projectId: string
  state: string
  setAction: (action: Actions | null) => void
  files: File[]
  fromURL: (url: string) => File | null
  toURL: (name: string, version: number) => string
  getLatest: (id: string) => File
}

type SectionConfigForm = Omit<Section, "id"> & {
  row: number | null,
  column: number | null
  fileName: string | null
  fileVersion: string | null
}

const dataTypes = ["html", "images", "videos", "markdown", "latex", "geojson"];

const getDataTypeFromFile = (file: File) => {
  if (file.name.endsWith(".html")) return "html";
  if (file.name.endsWith(".png") || file.name.endsWith(".jpg") || file.name.endsWith(".dzi")) return "images";
  if (file.name.endsWith(".mp4")) return "videos";
  if (file.name.endsWith(".md")) return "markdown";
  if (file.name.endsWith(".tex")) return "latex";
  if (file.name.endsWith(".json")) return "geojson";
  return null;
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

  const getRow = (section: Geometry) => {
    if (space.height / space.rows !== section.height) return null;

    for (let i = 0; i < space.cells.length; i++) {
      if (space.cells[i].y === section.y) return Math.floor(i / space.columns);
    }

    return null;
  };

  const getColumn = (section: Geometry) => {
    if (space.width / space.columns !== section.width) return null;

    for (let i = 0; i < space.cells.length; i++) {
      if (space.cells[i].x === section.x) return i % space.columns;
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
      resetField("row");
      resetField("column");
      setValue("fileName", "-- select an option --");
      setValue("fileVersion", "-- select an option --");
      setValue("dataType", "-- select an option --");
      return;
    }

    const section = sections.find(section => section.id === selected)!;
    setValue("x", section.x);
    setValue("y", section.y);
    setValue("width", section.width);
    setValue("height", section.height);
    setValue("row", getRow(section));
    setValue("column", getColumn(section));
    setValue("dataType", section.dataType);
    const file = fromURL(section.asset);
    if (file !== null) {
      setValue("fileName", file.name);
      setValue("fileVersion", file.version.toString());
    }
  }, [selected, sections]);

  const onSubmit = (section: SectionConfigForm) => {
    updateSection({
      x: mode === "custom" ? section.x : section.row! * (space.width / space.columns),
      y: mode === "custom" ? section.y : section.column! * (space.height / space.rows),
      width: mode === "custom" ? section.width : (space.width / space.columns),
      height: mode === "custom" ? section.height : (space.height / space.rows),
      config: JSON.parse(config),
      assetId: null,
      asset: "",
      dataType: "html",
      states: [state],
      ordering: section.ordering,
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
    setValue("width", 1);
    setValue("height", 1);
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
      <fieldset>
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
        {mode === "custom" ? <>
          <label htmlFor="x">x:</label>
          <input {...register("x")} />
          <label htmlFor="y">y:</label>
          <input {...register("y")} />
        </> : <>
          <label htmlFor="row">Row:</label>
          <input {...register("row")} />
        </>}
      </fieldset>
      <fieldset>
        <button className={styles.action} id={styles["fullscreen"]}
                type="button" onClick={fullscreen}><Fullscreen /></button>
        {mode === "custom" ? <>
          <label htmlFor="width">Width:</label>
          <input {...register("width")} />
          <label htmlFor="height">Height:</label>
          <input {...register("height")} />
        </> : <>
          <label htmlFor="column">Column:</label>
          <input {...register("column")} />
        </>}
      </fieldset>
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
          {dataTypes.map(type => <option key={type}
                                         value={type}>{type}</option>)}
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
