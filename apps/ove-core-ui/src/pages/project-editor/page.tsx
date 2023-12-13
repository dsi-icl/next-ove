import {
  type Actions as ActionsT,
  useActions,
  useContainer,
  useCustomStates,
  useSections,
  useSpace
} from "./hooks";
import Canvas from "./canvas/canvas";
import { useQuery } from "../../hooks";
import Actions from "./actions/actions";
import Metadata from "./metadata/metadata";
import Sections from "./sections/sections";
import { Dialog } from "@ove/ui-components";
import { type Section } from "@prisma/client";
import StateTabs from "./state-tabs/state-tabs";
import SpaceConfig from "./space-config/space-config";
import ResizeContainer from "./canvas/resize-container";
import SectionConfig from "./section-config/section-config";
import SectionImporter from "./section-importer/section-importer";

import styles from "./page.module.scss";

const dataTypes: { [key: string]: string } = {};

const project = {};

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
  const sections = useSections(sections_(query.get("project") ?? ""));
  const states = useCustomStates(sections.states, sections.select, sections.updateState, sections.removeState);

  const getDialogContent = () => {
    switch (action) {
      case "metadata":
        return <Metadata project={project} setAction={setAction} />;
      case "import-section":
        return <SectionImporter
          addToState={sections.addToState} colors={dataTypes}
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
                   setState={states.select} />
        <ResizeContainer container={container}>
          <Canvas sections={sections.getSections(states.selected)} space={space}
                  container={container}
                  dragSection={sections.dragSection} select={sections.select}
                  selected={sections.selected} colors={dataTypes} />
        </ResizeContainer>
      </section>
      <Sections sections={sections.getSections(states.selected)}
                select={sections.select} state={states.selected}
                removeFromState={sections.removeFromState}
                colors={dataTypes} selected={sections.selected}
                setAction={setAction} numStates={states.states.length} />
    </div>
    <section id={styles["configuration"]}>
      <SpaceConfig space={space} presets={observatories} />
      <SectionConfig sections={sections.getSections(states.selected)}
                     selected={sections.selected}
                     reorder={sections.reorder} />
      <Actions setAction={setAction} />
    </section>
    <Dialog ref={dialog} closeDialog={() => setAction(null)}
            title={getDialogTitle(action)}>
      {getDialogContent()}
    </Dialog>
  </main>;
};

export default ProjectEditor;
