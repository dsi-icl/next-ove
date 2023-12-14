import {
  type Actions as ActionsT,
  useActions,
  useContainer,
  useCustomStates,
  useFiles,
  useProject,
  useSections,
  useSpace
} from "./hooks";
import Canvas from "./canvas/canvas";
import { useQuery } from "../../hooks";
import Actions from "./actions/actions";
import Preview from "./preview/preview";
import Metadata from "./metadata/metadata";
import Sections from "./sections/sections";
import { Dialog } from "@ove/ui-components";
import StateTabs from "./state-tabs/state-tabs";
import FileUpload from "./file-upload/file-upload";
import SpaceConfig from "./space-config/space-config";
import ResizeContainer from "./canvas/resize-container";
import ConfigEditor from "./config-editor/config-editor";
import SectionConfig from "./section-config/section-config";
import Controller from "../../components/controller/controller";
import SectionImporter from "./section-importer/section-importer";
import ControllerEditor from "./controller-editor/controller-editor";

import styles from "./page.module.scss";

const colors: { [key: string]: string } = {
  HTML: "#FA9E78",
  IMAGES: "#FDEBDC",
  VIDEOS: "#6B9A9B"
};

const observatories = {};

const getDialogTitle = (action: ActionsT | null, title: string) => {
  switch (action) {
    case "metadata":
      return "Project Details";
    case "import-section":
      return "Import Section";
    case "controller":
      return "Edit Controller";
    case "upload":
      return "File Upload";
    case "preview":
      return "Preview Project";
    case "launch":
      return title;
    default:
      return "";
  }
};

const ProjectEditor = () => {
  const query = useQuery(); // TODO: load project from URL
  const space = useSpace();
  const { dialog, isOpen, action, setAction } = useActions();
  const container = useContainer(space);
  const projectId = query.get("project") ?? "";
  const { project, updateProject } = useProject(projectId);
  const sections = useSections(projectId);
  const states = useCustomStates(sections.states, sections.select, sections.updateState, sections.removeState);
  const { files, toURL, fromURL } = useFiles();

  const getDialogContent = () => {
    switch (action) {
      case "metadata":
        return <Metadata project={project} updateProject={updateProject}
                         setAction={setAction} files={files} toURL={toURL}
                         fromURL={fromURL} />;
      case "import-section":
        return <SectionImporter
          addToState={sections.addToState} colors={colors}
          setAction={setAction} selectedState={states.selected}
          getSections={sections.getSections} formatState={states.format}
          states={states.states.filter(state => state !== states.selected)} />;
      case "custom-config":
        return <ConfigEditor closeDialog={() => setAction(null)} />;
      case "controller":
        return <ControllerEditor />;
      case "upload":
        return <FileUpload />;
      case "launch":
        return <Controller />;
      case "preview":
        return <Preview />;
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
          <Canvas sections={sections.getSections(states.selected)}
                  space={space}
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
            title={getDialogTitle(action, project.title)}>
      {getDialogContent()}
    </Dialog>
    {isOpen ? <div id={styles["mask"]}></div> : <></>}
  </main>;
};

export default ProjectEditor;
