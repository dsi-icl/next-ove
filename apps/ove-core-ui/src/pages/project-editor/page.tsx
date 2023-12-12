import { useState } from "react";
import { useQuery } from "../../hooks";
import { useContainer, useSpace } from "./hooks";
import SpaceConfig from "./space-config/space-config";
import Canvas, { type Geometry } from "./canvas/canvas";
import ResizeContainer from "./canvas/resize-container";

import styles from "./page.module.scss";

const ProjectEditor = () => {
  const query = useQuery(); // TODO: load project from URL
  const space = useSpace();
  const container = useContainer(space);
  const [sections] = useState<(Geometry & { id: string })[]>([]); // TODO: load sections as state


  return <main className={styles.main}>
    <div id={styles["top"]}>
      <section id={styles["preview"]}>
        <h2>Preview</h2>
        <ResizeContainer container={container}>
          <Canvas sections={sections} space={space} container={container} />
        </ResizeContainer>
      </section>
      <section id={styles["sections"]}>
        <h2 style={{ textAlign: "center" }}>Sections</h2>
      </section>
    </div>
    <section id={styles["configuration"]}>
      <SpaceConfig space={space} />
    </section>
  </main>;
};

export default ProjectEditor;
