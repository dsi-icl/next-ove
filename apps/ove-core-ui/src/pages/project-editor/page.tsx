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
import { toProject } from "./utils";
import Canvas from "./canvas/canvas";
import { useQuery } from "../../hooks";
import Actions from "./actions/actions";
import { useState, type CSSProperties, useEffect } from "react";
import Metadata from "./metadata/metadata";
import Sections from "./sections/sections";
import { Dialog } from "@ove/ui-components";
import EnvEditor from "./env-editor/env-editor";
import StateTabs from "./state-tabs/state-tabs";
import FileUpload from "./file-upload/file-upload";
import SpaceConfig from "./space-config/space-config";
import ResizeContainer from "./canvas/resize-container";
import ConfigEditor from "./config-editor/config-editor";
import LaunchConfig from "./launch-config/launch-config";
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

const getDialogStyling = (action: ActionsT | null): CSSProperties | undefined => {
  if (action === "launch") return { width: "20vw", aspectRatio: "4/3" };

  return undefined;
};

const getInnerDialogStyling = (action: ActionsT | null): CSSProperties | undefined => {
  if (action !== null && ["controller", "custom-config", "env"].includes(action)) return {
    padding: "0"
  };

  return undefined;
};

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
  const {
    assets,
    files,
    toURL,
    fromURL,
    addFile,
    getLatest,
    getData
  } = useFiles();
  const [innerDialogStyle, setInnerDialogStyle] = useState<CSSProperties | undefined>();

  useEffect(() => {
    setInnerDialogStyle(undefined);
  }, [action]);

  const getDialogContent = () => {
    switch (action) {
      case "metadata":
        return <Metadata project={project} updateProject={updateProject}
                         setAction={setAction} files={files} toURL={toURL}
                         fromURL={fromURL} getLatest={getLatest} />;
      case "import-section":
        return <SectionImporter
          addToState={sections.addToState} colors={colors}
          setAction={setAction} selectedState={states.selected}
          getSections={sections.getSections} formatState={states.format}
          states={states.states.filter(state => state !== states.selected)} />;
      case "custom-config":
        return <ConfigEditor />;
      case "controller": {
        const controller = getLatest("control");
        return <ControllerEditor controller={getData(controller)}
                                 update={data => addFile(controller.name, data, controller.assetId)} />;
      }
      case "upload":
        return <FileUpload files={assets} getLatest={getLatest}
                           addFile={addFile}
                           setDialogStyle={setInnerDialogStyle} />;
      case "launch":
        return <LaunchConfig observatories={Object.keys(observatories)}
                             setAction={setAction} project={project}
                             sections={sections.all} />;
      case "env": {
        const env = getLatest("env");
        return <EnvEditor env={getData(env)}
                          update={data => addFile(env.name, data, env.assetId)} />;
      }
      case "live":
        return <Controller />;
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
                     setAction={setAction} files={assets} fromURL={fromURL}
                     selected={sections.selected} space={space} toURL={toURL}
                     state={states.selected} projectId={projectId}
                     getLatest={getLatest}
                     updateSection={sections.updateSection} />
      <Actions setAction={setAction}
               save={() => toProject(project, sections.all)} />
    </section>
    <Dialog ref={dialog} closeDialog={() => setAction(null)}
            title={getDialogTitle(action, project.title)}
            style={getDialogStyling(action)}
            hiddenStyle={innerDialogStyle ?? getInnerDialogStyling(action)}>
      {getDialogContent()}
    </Dialog>
    {isOpen ? <div id={styles["mask"]}></div> : <></>}
  </main>;
};

export default ProjectEditor;
