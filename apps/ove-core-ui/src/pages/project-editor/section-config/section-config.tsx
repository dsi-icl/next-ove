import { type Actions } from "../hooks";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { type Section } from "@prisma/client";
import { type Geometry, type Space } from "../types";
import { Grid, Brush, Fullscreen } from "react-bootstrap-icons";

import styles from "./section-config.module.scss";

type SectionConfigProps = {
  sections: Section[]
  selected: string | null
  updateSection: (section: Omit<Section, "id">) => void
  space: Space & { cells: Geometry[] }
  projectId: string
  state: string
  setAction: (action: Actions | null) => void
}

type SectionConfigForm = Omit<Section, "id"> & {
  row: number | null,
  column: number | null
}

const SectionConfig = ({
  sections,
  selected,
  updateSection,
  space,
  projectId,
  state,
  setAction
}: SectionConfigProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    resetField
  } = useForm<SectionConfigForm>();
  const [mode, setMode] = useState<"custom" | "grid">("custom");

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
    if (selected === null) {
      resetField("ordering");
      resetField("x");
      resetField("y");
      resetField("width");
      resetField("height");
      resetField("row");
      resetField("column");
      return;
    }

    const section = sections.find(section => section.id === selected)!;
    setValue("ordering", section.ordering);
    setValue("x", section.x);
    setValue("y", section.y);
    setValue("width", section.width);
    setValue("height", section.height);
    setValue("row", getRow(section));
    setValue("column", getColumn(section));
  }, [selected, sections]);

  const onSubmit = (config: SectionConfigForm) => {
    updateSection({
      x: mode === "custom" ? config.x : config.row! * (space.width / space.columns),
      y: mode === "custom" ? config.y : config.column! * (space.height / space.rows),
      width: mode === "custom" ? config.width : (space.width / space.columns),
      height: mode === "custom" ? config.height : (space.height / space.rows),
      config: null,
      assetId: null,
      asset: "",
      dataType: "html",
      states: [state],
      ordering: config.ordering,
      projectId: projectId
    });
  };

  const fullscreen = () => {
    setValue("x", 0);
    setValue("y", 0);
    setValue("width", 1);
    setValue("height", 1);
  };

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
        <label>Config:</label>
        <input className={styles.config} type="button" {...register("config")} onClick={() => setAction("custom-config")} />
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
      <button className={styles.submit} type="submit" />
    </form>
  </section>;
};

export default SectionConfig;
