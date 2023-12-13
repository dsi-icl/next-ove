import {
  type Actions as ActionsT,
  useActions,
  useContainer,
  useCustomStates, useProject,
  useSections,
  useSpace
} from "./hooks";
import Canvas from "./canvas/canvas";
import { useQuery } from "../../hooks";
import Actions from "./actions/actions";
import Metadata from "./metadata/metadata";
import Sections from "./sections/sections";
import { Dialog } from "@ove/ui-components";
import StateTabs from "./state-tabs/state-tabs";
import SpaceConfig from "./space-config/space-config";
import ResizeContainer from "./canvas/resize-container";
import { type Project, type Section } from "@prisma/client";
import SectionConfig from "./section-config/section-config";
import SectionImporter from "./section-importer/section-importer";

import styles from "./page.module.scss";

const colors: { [key: string]: string } = {};

const project_ = (projectId: string): Project => ({});

const observatories = {};

const sections_: (projectId: string) => Section[] = (projectId: string) => [];

const getDialogTitle = (action: ActionsT | null) => {
  switch (action) {
    case "metadata":
      return "Metadata Config";
    case "import-section":
      return "Import Section";
    default:
      return "";
  }
};

const ProjectEditor = () => {
  const query = useQuery(); // TODO: load project from URL
  const space = useSpace();
  const { dialog, action, setAction } = useActions();
  const container = useContainer(space);
  const projectId = query.get("project") ?? "";
  const { project } = useProject(project_(projectId));
  const sections = useSections(sections_(projectId), projectId);
  const states = useCustomStates(sections.states, sections.select, sections.updateState, sections.removeState);

  const getDialogContent = () => {
    switch (action) {
      case "metadata":
        return <Metadata project={project} setAction={setAction} />;
      case "import-section":
        return <SectionImporter
          addToState={sections.addToState} colors={colors}
          setAction={setAction} selectedState={states.selected}
          getSections={sections.getSections} formatState={states.format}
          states={states.states.filter(state => state !== states.selected)} />;
      default:
        return <></>;
    }
  };

  return <main className={styles.main}>
    <div id={styles["top"]}>
      <section id={styles["preview"]}>
        <StateTabs selected={states.selected} removeState={states.removeState}
                   states={states.states} formatState={states.format}
                   addState={states.addState} updateState={states.updateState}
                   setState={states.select} currentState={states.selected} />
        <ResizeContainer container={container}>
          <Canvas sections={sections.getSections(states.selected)} space={space}
                  container={container}
                  dragSection={sections.dragSection} select={sections.select}
                  selected={sections.selected} colors={colors} />
        </ResizeContainer>
      </section>
      <Sections sections={sections.getSections(states.selected)}
                generateSection={sections.generateSection}
                select={sections.select} state={states.selected}
                removeFromState={sections.removeFromState}
                colors={colors} selected={sections.selected}
                setSections={sections.setSections}
                setAction={setAction} numStates={states.states.length} />
    </div>
    <section id={styles["configuration"]}>
      <SpaceConfig space={space} presets={observatories} />
      <SectionConfig sections={sections.getSections(states.selected)}
                     setAction={setAction}
                     selected={sections.selected} space={space}
                     state={states.selected} projectId={projectId}
                     updateSection={sections.updateSection} />
      <Actions setAction={setAction} />
    </section>
    <Dialog ref={dialog} closeDialog={() => setAction(null)}
            title={getDialogTitle(action)}>
      {getDialogContent()}
    </Dialog>
  </main>;
};

export default ProjectEditor;
