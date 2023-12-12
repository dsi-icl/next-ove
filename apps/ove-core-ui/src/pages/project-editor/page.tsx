import { useState } from "react";
import Canvas from "./canvas/canvas";
import { useQuery } from "../../hooks";
import Sections from "./sections/sections";
import { type Section } from "@prisma/client";
import { useContainer, useSpace } from "./hooks";
import SpaceConfig from "./space-config/space-config";
import ResizeContainer from "./canvas/resize-container";

import styles from "./page.module.scss";

const sections_: Section[] = [];

const ProjectEditor = () => {
  const query = useQuery(); // TODO: load project from URL
  const space = useSpace();
  const container = useContainer(space);
  const [sections] = useState<Section[]>(sections_); // TODO: load sections as state


  return <main className={styles.main}>
    <div id={styles["top"]}>
      <section id={styles["preview"]}>
        <h2>Preview</h2>
        <ResizeContainer container={container}>
          <Canvas sections={sections} space={space} container={container} />
        </ResizeContainer>
      </section>
      <Sections sections={sections} />
    </div>
    <section id={styles["configuration"]}>
      <SpaceConfig space={space} />
    </section>
  </main>;
};

export default ProjectEditor;
