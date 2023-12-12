import Canvas from "./canvas/canvas";
import { useQuery } from "../../hooks";
import Sections from "./sections/sections";
import { type Section } from "@prisma/client";
import StateTabs from "./state-tabs/state-tabs";
import SpaceConfig from "./space-config/space-config";
import ResizeContainer from "./canvas/resize-container";
import SectionConfig from "./section-config/section-config";
import { useContainer, useProjectState, useSections, useSpace } from "./hooks";

import styles from "./page.module.scss";

const sections_: (projectId: string) => Section[] = (projectId: string) => [];

const ProjectEditor = () => {
  const query = useQuery(); // TODO: load project from URL
  const {state, setState} = useProjectState();
  const space = useSpace();
  const container = useContainer(space);
  const {
    sections,
    dragSection,
    select,
    selected,
    reorder
  } = useSections(state, sections_(query.get("project") ?? ""));


  return <main className={styles.main}>
    <div id={styles["top"]}>
      <section id={styles["preview"]}>
        <StateTabs sections={sections} setState={(state: string) => {
          select(null);
          setState(state);
        }} />
        <ResizeContainer container={container}>
          <Canvas sections={sections} space={space} container={container}
                  dragSection={dragSection} select={select} />
        </ResizeContainer>
      </section>
      <Sections sections={sections} select={select} />
    </div>
    <section id={styles["configuration"]}>
      <SpaceConfig space={space} />
      <SectionConfig sections={sections} selected={selected}
                     reorder={reorder} />
    </section>
  </main>;
};

export default ProjectEditor;
