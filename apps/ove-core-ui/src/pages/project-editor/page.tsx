import { useQuery } from "../../hooks";
import { useForm } from "react-hook-form";
import ResizeContainer from "./resize-container";
import Preview, { type Geometry } from "./preview";
import { useEffect, useRef, useState } from "react";

import styles from "./page.module.scss";

type SpaceConfig = {
  width: number
  height: number
  rows: number
  columns: number
}

const useContainer = (space: { width: number, height: number }) => {
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);
  const ref = useRef<HTMLDivElement | null>(null);

  const update = (contentRect?: { width: number, height: number }) => {
    if (ref.current === null) return;
    const contentRect_ = contentRect ?? ref.current!.getBoundingClientRect();
    const multiple = Math.min(contentRect_.width / space.width, contentRect_.height / space.height);
    setWidth(multiple * space.width);
    setHeight(multiple * space.height);
  };

  useEffect(update, [space.width, space.height]);

  return { width, height, ref, update };
};

const useSpace = () => {
  const [rows, setRows] = useState(2);
  const [columns, setColumns] = useState(2);
  const [width, setWidth] = useState(3840);
  const [height, setHeight] = useState(2160);

  const update = (space: SpaceConfig) => {
    setHeight(space.height || 4320);
    setWidth(space.width || 30720);
    setColumns(space.columns || 16);
    setRows(space.rows || 4);
  };

  return { rows, columns, width, height, update };
};

const ProjectEditor = () => {
  const query = useQuery(); // TODO: load project from URL
  const { register, handleSubmit } = useForm<SpaceConfig>();
  const space = useSpace();
  const container = useContainer(space);
  const [sections,] = useState<(Geometry & {id: string})[]>([]); // TODO: load sections as state

  return <main className={styles.main}>
    <div id={styles["top"]}>
      <section id={styles["preview"]}>
        <h2>Preview</h2>
        <ResizeContainer container={container}>
          <Preview sections={sections} space={space} container={container} />
        </ResizeContainer>
      </section>
      <section id={styles["sections"]}>
        <h2 style={{ textAlign: "center" }}>Sections</h2>
      </section>
    </div>
    <section id={styles["configuration"]}>
      <h2>Configuration</h2>
      <section>
        <h4>Space Config</h4>
        <form onSubmit={handleSubmit(space.update)}
              style={{ display: "flex", flexDirection: "column" }}>
          <label htmlFor="width">Width Ratio:</label>
          <input {...register("width")} type="number" />
          <label htmlFor="height">Height Ratio:</label>
          <input {...register("height")} type="number" />
          <label htmlFor="rows">Rows:</label>
          <input {...register("rows")} type="number" />
          <label htmlFor="cols">Columns:</label>
          <input {...register("columns")} type="number" />
          <button type="submit" style={{ display: "none" }} />
        </form>
      </section>
    </section>
  </main>;
};

export default ProjectEditor;
