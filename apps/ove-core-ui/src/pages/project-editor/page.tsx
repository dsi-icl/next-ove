import {
  type Actions as ActionsT,
  useActions,
  useCollaboration,
  useContainer,
  useCustomStates,
  useFiles, useObservatories,
  useSections,
  useSpace
} from "./hooks";
import { dataTypes, toProject } from "./utils";
import Canvas from "./canvas/canvas";
import Actions from "./actions/actions";
import Sections from "./sections/sections";
import { Dialog } from "@ove/ui-components";
import { type Project, type Section } from "@prisma/client";
import EnvEditor from "./env-editor/env-editor";
import StateTabs from "./state-tabs/state-tabs";
import FileUpload from "./file-upload/file-upload";
import SpaceConfig from "./space-config/space-config";
import ResizeContainer from "./canvas/resize-container";
import ConfigEditor from "./config-editor/config-editor";
import LaunchConfig from "./launch-config/launch-config";
import SectionConfig from "./section-config/section-config";
import { useState, type CSSProperties, useEffect } from "react";
import Controller from "../../components/controller/controller";
import SectionImporter from "./section-importer/section-importer";
import ControllerEditor from "./controller-editor/controller-editor";
import Metadata, { type ProjectMetadata } from "./metadata/metadata";

import styles from "./page.module.scss";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@ove/ui-base-components";

const getDialogStyling = (action: ActionsT | null): CSSProperties | undefined => {
  if (action === "launch") return {
    width: "20vw",
    aspectRatio: "4/3.25",
    borderRadius: "0.25rem"
  };
  if (action !== null && ["controller", "custom-config", "env"].includes(action)) return {
    width: "60vw", borderRadius: "0.25rem"
  };

  return { borderRadius: "0.25rem" };
};

const getInnerDialogStyling = (action: ActionsT | null): CSSProperties | undefined => {
  if (action !== null && ["controller", "custom-config", "env"].includes(action)) return {
    padding: "0"
  };
  if (action === "import-section") return {
    padding: "1rem"
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

type ProjectEditorProps = {
  project: Project & { layout: Section[] }
  updateProject: (project: ProjectMetadata) => void
  tags: string[]
  username: string
}

const ProjectEditor = ({
  project,
  updateProject,
  tags,
  username
}: ProjectEditorProps) => {
  const { observatories } = useObservatories();
  const space = useSpace();
  const { dialog, isOpen, action, setAction } = useActions();
  const container = useContainer(space);
  const sections = useSections(project.id, project.layout);
  const states = useCustomStates(sections.states, sections.select, sections.updateState, sections.removeState);
  const {
    assets,
    toURL,
    fromURL,
    addFile,
    getLatest,
    getData,
    generateThumbnail
  } = useFiles(project.id);
  const [innerDialogStyle, setInnerDialogStyle] = useState<CSSProperties | undefined>();
  const {
    invited,
    accepted,
    uninvited,
    inviteCollaborator,
    removeCollaborator
  } = useCollaboration(project, username);

  useEffect(() => {
    setInnerDialogStyle(undefined);
  }, [action]);

  const getDialogContent = () => {
    if (project === null) return null;
    switch (action) {
      case "metadata":
        return <Metadata project={project} updateProject={updateProject}
                         setAction={setAction} files={assets} toURL={toURL}
                         fromURL={fromURL} getLatest={getLatest}
                         allTags={tags} invited={invited} uninvited={uninvited}
                         generator={generateThumbnail} accepted={accepted}
                         inviteCollaborator={inviteCollaborator}
                         removeCollaborator={removeCollaborator}
                         closeDialog={() => setAction(null)} />;
      case "import-section":
        return <SectionImporter
          addToState={sections.addToState} colors={dataTypes}
          setAction={setAction} selectedState={states.selected}
          getSections={sections.getSectionsToImport} formatState={states.format}
          states={states.states.filter(state => state !== states.selected)} />;
      case "custom-config":
        return <ConfigEditor />;
      case "controller": {
        const controller = getLatest("control");
        return <ControllerEditor controller={controller} getData={getData}
                                 update={data => addFile(controller.name, data, controller.assetId)} />;
      }
      case "upload":
        return <FileUpload files={assets} getLatest={getLatest}
                           addFile={addFile} closeDialog={() => setAction(null)}
                           setDialogStyle={setInnerDialogStyle} />;
      case "launch":
        return <LaunchConfig observatories={Object.keys(observatories)}
                             setAction={setAction} project={project}
                             sections={sections.all} />;
      case "env": {
        const env = getLatest("env");
        return <EnvEditor env={env} getData={getData}
                          update={data => addFile(env.name, data, env.assetId)} />;
      }
      case "live":
        return <Controller />;
      default:
        return <></>;
    }
  };

  return <main className={styles.main}>
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={95}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={60}>
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={75}>
                <StateTabs selected={states.selected}
                           removeState={states.removeState}
                           states={states.states} formatState={states.format}
                           addState={states.addState}
                           updateState={states.updateState}
                           setState={states.select}
                           currentState={states.selected} />
                <ResizeContainer container={container} useContentRect={false}>
                  <Canvas sections={sections.getSections(states.selected)}
                          space={space}
                          container={container}
                          dragSection={sections.dragSection}
                          select={sections.select}
                          selected={sections.selected} />
                </ResizeContainer>
              </ResizablePanel>
              <ResizableHandle withHandle={!isOpen} />
              <ResizablePanel defaultSize={25}>
                <Sections sections={sections.getSections(states.selected)}
                          generateSection={sections.generateSection}
                          select={sections.select} state={states.selected}
                          removeFromState={sections.removeFromState}
                          selected={sections.selected}
                          setSections={sections.setSections}
                          setAction={setAction}
                          numStates={states.states.length} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle withHandle={!isOpen} />
          <ResizablePanel defaultSize={40}>
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={40}>
                <SpaceConfig space={space} presets={observatories} />
              </ResizablePanel>
              <ResizableHandle withHandle={!isOpen} />
              <ResizablePanel defaultSize={60}>
                <SectionConfig sections={sections.getSections(states.selected)}
                               setAction={setAction} files={assets}
                               fromURL={fromURL}
                               selected={sections.selected} space={space}
                               toURL={toURL}
                               state={states.selected} projectId={project.id}
                               getLatest={getLatest}
                               updateSection={sections.updateSection} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle withHandle={!isOpen} />
      <ResizablePanel defaultSize={5}>
        <Actions setAction={setAction}
                 save={() => toProject(project, sections.all)} />
      </ResizablePanel>
    </ResizablePanelGroup>
    <Dialog ref={dialog} closeDialog={() => setAction(null)}
            title={getDialogTitle(action, project.title)}
            style={getDialogStyling(action)}
            hiddenStyle={innerDialogStyle ?? getInnerDialogStyling(action)}>
      {getDialogContent()}
    </Dialog>
    {
      isOpen ? <div id={styles["mask"]}></div> : <></>
    }
  </main>
    ;
};

export default ProjectEditor;
