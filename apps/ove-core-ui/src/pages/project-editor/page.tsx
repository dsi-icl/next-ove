import {
  type Actions as ActionsT,
  useActions,
  useContainer,
  useProjectState,
  useSections,
  useSpace
} from "./hooks";
import Canvas from "./canvas/canvas";
import { useQuery } from "../../hooks";
import Actions from "./actions/actions";
import Sections from "./sections/sections";
import { Dialog } from "@ove/ui-components";
import { type Section } from "@prisma/client";
import StateTabs from "./state-tabs/state-tabs";
import SpaceConfig from "./space-config/space-config";
import ResizeContainer from "./canvas/resize-container";
import SectionConfig from "./section-config/section-config";
import Metadata, { type ProjectMetadata } from "./metadata/metadata";

import styles from "./page.module.scss";

const dataTypes: { [key: string]: string } = {};

const project: ProjectMetadata = {} as ProjectMetadata;

const observatories = {};

const sections_: (projectId: string) => Section[] = (projectId: string) => [];

const getDialogTitle = (action: string | null) => {
  switch (action) {
    case "metadata":
      return "Metadata Config";
    default:
      return "";
  }
};

const getDialogContent = (action: ActionsT | null, setAction: (action: ActionsT | null) => void, project: ProjectMetadata) => {
  switch (action) {
    case "metadata":
      return <Metadata project={project} setAction={setAction} />;
    default:
      return <></>;
  }
};

const ProjectEditor = () => {
  const query = useQuery(); // TODO: load project from URL
  const { state, setState } = useProjectState();
  const space = useSpace();
  const { dialog, action, setAction } = useActions();
  const container = useContainer(space);
  const sections = useSections(state, sections_(query.get("project") ?? ""));


  return <main className={styles.main}>
    <div id={styles["top"]}>
      <section id={styles["preview"]}>
        <StateTabs selected={state} removeState={sections.removeState}
                   states={sections.states} setState={(state: string) => {
          sections.select(null);
          setState(state);
        }} />
        <ResizeContainer container={container}>
          <Canvas sections={sections.sections} space={space}
                  container={container}
                  dragSection={sections.dragSection} select={sections.select}
                  selected={sections.selected} colors={dataTypes} />
        </ResizeContainer>
      </section>
      <Sections sections={sections.sections} select={sections.select}
                colors={dataTypes} selected={sections.selected} />
    </div>
    <section id={styles["configuration"]}>
      <SpaceConfig space={space} presets={observatories} />
      <SectionConfig sections={sections.sections} selected={sections.selected}
                     reorder={sections.reorder} />
      <Actions setAction={setAction} />
    </section>
    <Dialog ref={dialog} closeDialog={() => setAction(null)}
            title={getDialogTitle(action)}>
      {getDialogContent(action, setAction, project)}
    </Dialog>
  </main>;
};

export default ProjectEditor;
