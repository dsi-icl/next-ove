import { z } from "zod";
import {
  useForm,
  type UseFormRegister,
  type UseFormSetValue
} from "react-hook-form";
import { toast } from "sonner";
import type { Actions } from "../hooks";
import { assert } from "@ove/ove-utils";
import type { Section } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormErrorHandling } from "@ove/ui-components";
import type { Geometry as TGeometry, Space } from "../types";
import React, { useCallback, useEffect, useState } from "react";
import { Grid, Brush, Fullscreen } from "react-bootstrap-icons";
import { type File, dataTypes, type DataType } from "@ove/ove-types";
import S3FileSelect from "../../../components/s3-file-select/s3-file-select";

import styles from "./section-config.module.scss";

type SectionConfigProps = {
  sections: Section[]
  selected: string | null
  updateSection: (section: Omit<Section, "id">) => void
  space: { space: Space | null, cells: TGeometry[] | null }
  projectId: string
  state: string
  setAction: (action: Actions | null) => void
  files: File[]
  fromURL: (url: string | null) => File | null
  toURL: (bucketName: string, name: string, version: string) => string
  getLatest: (bucketName: string, name: string) => File
  hasVersion: (bucketName: string, name: string, version: string) => boolean
}

const getDataTypeFromFile = (file: File) => {
  for (const dt of dataTypes) {
    if (dt.extensions.some(extension =>
      file.name.toLowerCase().endsWith(extension.toLowerCase()))) {
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

const getRow = (y: number, space: {
  space: Space | null,
  cells: TGeometry[] | null
}) => {
  if (space.space === null || space.cells === null) return null;
  if (y === 0) return 0;
  if (y === 1) return space.space.rows;
  for (let i = 0; i < space.cells.length; i++) {
    if (space.cells[i].y === y * space.space.height) {
      return Math.floor(i / space.space.columns);
    }
  }

  return null;
};

const getColumn = (x: number, space: {
  space: Space | null,
  cells: TGeometry[] | null
}) => {
  if (space.space === null || space.cells === null) return null;
  if (x === 0) return 0;
  if (x === 1) return space.space.columns;
  for (let i = 0; i < space.cells.length; i++) {
    if (space.cells[i].x === x * space.space.width) {
      return i % space.space.columns;
    }
  }

  return null;
};

const SectionConfigFormSchema = z.strictObject({
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  x: z.number().nullable().optional(),
  y: z.number().nullable().optional(),
  fileName: z.string().nullable().optional(),
  fileVersion: z.string().nullable().optional(),
  rowFrom: z.number().nullable().optional(),
  rowTo: z.number().nullable().optional(),
  columnFrom: z.number().nullable().optional(),
  columnTo: z.number().nullable().optional(),
  dataType: z.string(),
  asset: z.string()
});

type SectionConfigForm = z.infer<typeof SectionConfigFormSchema>

const SectionConfig = ({
  hasVersion,
  sections,
  selected,
  updateSection,
  space,
  projectId,
  state,
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
    watch,
    formState: { errors }
  } = useForm<SectionConfigForm>(
    { resolver: zodResolver(SectionConfigFormSchema) });
  useFormErrorHandling(errors);
  const [mode, setMode] = useState<"custom" | "grid">("custom");
  const [fileName, fileVersion] = watch(["fileName", "fileVersion"]);

  const resetFields = useCallback(() => {
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
  }, [resetField, setValue]);

  useEffect(() => {
    if (selected === null) {
      resetFields();
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
      setValue("fileName", `${file.bucketName}/${file.name}`);
      setValue("fileVersion", file.version.toString());
    }
  }, [selected, sections, fromURL, resetField, setValue, space]);

  const onSubmit = (section: SectionConfigForm) => {
    if (mode === "grid" && (space.space === null || space.cells === null)) {
      toast.error("Please select an observatory");
      return;
    }
    updateSection({
      x: mode === "custom" ? fromPercentage(assert(section.x)) :
        assert(section.columnFrom) / assert(space.space).columns,
      y: mode === "custom" ? fromPercentage(assert(section.y)) :
        assert(section.rowFrom) / assert(space.space).rows,
      width: mode === "custom" ? fromPercentage(assert(section.width)) :
        (assert(section.columnTo) - assert(
          section.columnFrom)) * (1 / assert(space.space).columns),
      height: mode === "custom" ? fromPercentage(assert(section.height)) :
        (assert(section.rowTo) - assert(
          section.rowFrom)) * (1 / assert(space.space).rows),
      assetId: files.find(({
        name,
        version
      }) => name === section.fileName &&
        version.toString() === section.fileVersion)?.name ?? null,
      asset: section.asset,
      dataType: section.dataType,
      states: [state],
      ordering: sections.find(section =>
        section.id === selected)?.ordering ?? sections.length,
      projectId
    });

    resetFields();
  };

  const url = watch("asset");

  const onAssetChange = useCallback((asset: string) => {
    const file = fromURL(asset ?? "");
    setValue("fileVersion", file === null ? "-- select an option --" : file.version);
    setValue("fileName", file === null ? "-- select an option --" : `${file.bucketName}/${file.name}`);
    if (file !== null) {
      setValue("dataType", getDataTypeFromFile(file) ??
        "-- select an option --");
    }
  }, [setValue, fromURL]);

  useEffect(() => {
    onAssetChange(url);
  }, [url, onAssetChange]);

  useEffect(() => {
    if (fileName === null || fileName === undefined || fileName === "-- select an option --") return;
    const [bn, fn] = fileName.split("/");
    const fv = fileVersion === null || fileVersion === undefined || fileVersion === "-- select an option --" || !hasVersion(bn, fn, fileVersion) ? getLatest(bn, fn).version : fileVersion;
    setValue("asset", toURL(bn, fn, fv));
  }, [fileName, setValue, toURL, fileVersion, getLatest, hasVersion]);

  return <section id={styles["section-config"]}>
    <h2>Section Config</h2>
    <form onSubmit={handleSubmit(onSubmit)}>
      <div id={styles["left-container"]}>
        <Geometry setMode={setMode} mode={mode} space={space.space}
                  setValue={setValue} register={register} />
      </div>
      <fieldset id={styles["assets"]}>
        <label htmlFor="asset">Asset:</label>
        <input {...register("asset")} />
        <S3FileSelect register={register} watch={watch} files={files} />
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
  register: UseFormRegister<SectionConfigForm>,
  setMode: (mode: "custom" | "grid") => void,
  setValue: UseFormSetValue<SectionConfigForm>,
  space: Space | null
}) => {
  const fullscreen = () => {
    setValue("x", 0);
    setValue("y", 0);
    setValue("width", 100);
    setValue("height", 100);
    setValue("columnFrom", 0);
    setValue("columnTo", space?.columns ?? 0);
    setValue("rowFrom", 0);
    setValue("rowTo", space?.rows ?? 0);
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
          <input {...register("x", { valueAsNumber: true })} />
          <span className={styles.percentage}>%</span>
        </div>
      </div>
      <div className={styles.column}>
        <label htmlFor="y">y:</label>
        <div className={styles["percentage-container"]}>
          <input {...register("y", { valueAsNumber: true })} />
          <span className={styles.percentage}>%</span>
        </div>
      </div>
      <div className={styles.column}>
        <label htmlFor="width">Width:</label>
        <div className={styles["percentage-container"]}>
          <input {...register("width", { valueAsNumber: true })} />
          <span className={styles.percentage}>%</span>
        </div>
      </div>
      <div className={styles.column}>
        <label htmlFor="height">Height:</label>
        <div className={styles["percentage-container"]}>
          <input {...register("height", { valueAsNumber: true })} />
          <span className={styles.percentage}>%</span>
        </div>
      </div>
    </fieldset>
    <fieldset style={mode === "grid" ? undefined : { display: "none" }}>
      <div className={styles.column}>
        <label htmlFor="rowFrom">Row:</label>
        <input
          disabled={space === null}
          {...register("rowFrom", { valueAsNumber: true })}
          placeholder="From:" />
      </div>
      <div className={styles.column}>
        <input
          disabled={space === null}
          className={styles.to}
          {...register("rowTo", { valueAsNumber: true })}
          placeholder="To:" />
      </div>
      <div className={styles.column}>
        <label htmlFor="columnFrom">Column:</label>
        <input
          disabled={space === null}
          {...register("columnFrom", { valueAsNumber: true })}
          placeholder="From:" />
      </div>
      <div className={styles.column}>
        <input
          disabled={space === null} className={styles.to}
          {...register("columnTo", { valueAsNumber: true })}
          placeholder="To:" />
      </div>
    </fieldset>
  </div>;
};

export default SectionConfig;
