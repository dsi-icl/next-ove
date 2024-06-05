import {
  type Actions as ActionsT,
  type LaunchConfig as LaunchConfigT,
  useCollaboration,
  useContainer,
  useCustomStates,
  useFiles,
  useSections,
  useSpace
} from "./hooks";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@ove/ui-base-components";
import Canvas from "./canvas/canvas";
import Actions from "./actions/actions";
import { dataTypes } from "@ove/ove-types";
import Sections from "./sections/sections";
import { Dialog } from "@ove/ui-components";
import EnvEditor from "./env-editor/env-editor";
import StateTabs from "./state-tabs/state-tabs";
import FileUpload from "./file-upload/file-upload";
import SpaceConfig from "./space-config/space-config";
import type { Project, Section } from "@prisma/client";
import ResizeContainer from "./canvas/resize-container";
import { assert, titleToBucketName } from "@ove/ove-utils";
import { useActions, useObservatories } from "../../hooks";
import SectionConfig from "./section-config/section-config";
import Controller from "../../components/controller/controller";
import SectionImporter from "./section-importer/section-importer";
import ControllerEditor from "./controller-editor/controller-editor";
import Metadata, { type ProjectMetadata } from "./metadata/metadata";
import React, { useState, type CSSProperties, useEffect } from "react";
import LaunchConfig from "../../components/launch-config/launch-config";

import styles from "./page.module.scss";

const getDialogStyling = (
  action: ActionsT | null
): CSSProperties | undefined => {
  if (action === "launch") {
    return {
      width: "20vw",
      aspectRatio: "4/3.25",
      borderRadius: "0.25rem"
    };
  }
  if (action !== null &&
    ["controller", "custom-config", "env"].includes(action)) {
    return {
      width: "60vw", borderRadius: "0.25rem"
    };
  } else if (action === "live") {
    return {
      width: "calc((90vh / 9) * 16)",
      aspectRatio: "unset",
      height: "calc(90vh + 3rem)",
      maxHeight: "100vh"
    };
  }

  return { borderRadius: "0.25rem" };
};

const getInnerDialogStyling = (
  action: ActionsT | null
): CSSProperties | undefined => {
  if (action !== null &&
    ["controller", "env", "live"].includes(action)) {
    return {
      padding: "0"
    };
  }
  if (action === "import-section") {
    return {
      padding: "1rem"
    };
  }

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
  project: Project
  updateProject: (project: ProjectMetadata) => void
  tags: string[]
  saveProject: (project: Project, layout: Section[]) => void
  token: string
}

const ProjectEditor = ({
  project,
  updateProject,
  tags,
  saveProject,
  token
}: ProjectEditorProps) => {
  const { observatories } = useObservatories();
  const space = useSpace(observatories);
  const {
    dialog,
    isOpen,
    action,
    config,
    setAction
  } = useActions<ActionsT | null>();
  const container = useContainer(space.space);
  const sections = useSections(project.id);
  const states = useCustomStates(
    sections.states,
    sections.select,
    sections.updateState,
    sections.removeState
  );
  const {
    assets,
    toURL,
    fromURL,
    uploadFile,
    getLatest,
    getData,
    hasVersion,
    generateThumbnail
  } = useFiles(project.id, token);
  const [innerDialogStyle, setInnerDialogStyle] =
    useState<CSSProperties | undefined>();
  const bucketName = titleToBucketName(project.title);
  const {
    invited,
    accepted,
    uninvited,
    inviteCollaborator,
    removeCollaborator
  } = useCollaboration(project);

  useEffect(() => {
    setInnerDialogStyle(undefined);
  }, [action]);

  const getDialogContent = () => {
    if (project === null) return null;
    switch (action) {
      case "metadata":
        return <Metadata project={project} updateProject={updateProject}
                         setAction={setAction}
                         files={assets.filter(({ bucketName: bn }) =>
                           bucketName === bn)}
                         toURL={(name, version) =>
                           toURL(bucketName, name, version)}
                         fromURL={fromURL}
                         getLatest={name => getLatest(bucketName, name)}
                         allTags={tags} invited={invited} uninvited={uninvited}
                         generator={generateThumbnail} accepted={accepted}
                         inviteCollaborator={inviteCollaborator}
                         bucketName={bucketName}
                         removeCollaborator={removeCollaborator}
                         closeDialog={() => setAction(null)} />;
      case "import-section":
        return <SectionImporter
          addToState={sections.addToState} colors={dataTypes}
          setAction={setAction} selectedState={states.selected}
          getSections={sections.getSectionsToImport} formatState={states.format}
          states={states.states.filter(state => state !== states.selected)} />;
      case "controller": {
        const controller = getLatest(bucketName, "control.html");
        const fn = (data: string) =>
          uploadFile(controller.name, new File([data],
            controller.name, { type: "text/plain" }));
        return <ControllerEditor controller={controller} getData={getData}
                                 update={fn} />;
      }
      case "upload":
        return <FileUpload files={assets} getLatest={getLatest}
                           uploadFile={uploadFile}
                           closeDialog={() => setAction(null)}
                           setDialogStyle={setInnerDialogStyle} />;
      case "launch":
        return <LaunchConfig observatories={Object.keys(observatories)}
                             sections={sections.all}
                             launch={(config: LaunchConfigT) =>
                               void setAction("live", config)}
                             project={project} />;
      case "env": {
        const env = getLatest(bucketName, "env.json");
        const fn = (data: string) =>
          uploadFile(env.name, new File([data],
            env.name, { type: "text/plain" }));
        return <EnvEditor env={env} getData={getData} update={fn} />;
      }
      case "live":
        return <Controller config={assert(config)} />;
      default:
        return null;
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
                           setState={states.select} />
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
              <ResizablePanel defaultSize={20}>
                {space.name !== null ?
                  <SpaceConfig space={space} presets={observatories} /> : null}
              </ResizablePanel>
              <ResizableHandle withHandle={!isOpen} />
              <ResizablePanel defaultSize={80}>
                <SectionConfig sections={sections.getSections(states.selected)}
                               setAction={setAction} files={assets}
                               fromURL={fromURL} getLatest={getLatest}
                               selected={sections.selected} space={space}
                               toURL={toURL} hasVersion={hasVersion}
                               state={states.selected} projectId={project.id}
                               updateSection={sections.updateSection} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle withHandle={!isOpen} />
      <ResizablePanel defaultSize={5}>
        <Actions setAction={setAction} projectId={project.id}
                 save={() => saveProject(project, sections.all)} />
      </ResizablePanel>
    </ResizablePanelGroup>
    <Dialog ref={dialog} closeDialog={() => setAction(null)}
            title={getDialogTitle(action, project.title)}
            style={getDialogStyling(action)}
            hiddenStyle={innerDialogStyle ?? getInnerDialogStyling(action)}>
      {getDialogContent()}
    </Dialog>
    {isOpen ? <div id={styles["mask"]}></div> : null}
  </main>;
};

export default ProjectEditor;
