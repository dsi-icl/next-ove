import { trpc } from "../../utils/api";
import { assert } from "@ove/ove-utils";
import React, { useState } from "react";
import { isError } from "@ove/ove-types";
import ProjectCard from "./project-card";
import { Dialog } from "@ove/ui-components";
import { Plus } from "react-bootstrap-icons";
import type { Project, User } from "@prisma/client";
import { useActions, useObservatories } from "../../hooks";
import Controller from "../../components/controller/controller";
import LaunchConfig from "../../components/launch-config/launch-config";
import type { LaunchConfig as LaunchConfigT } from "../project-editor/hooks";

import styles from "./launcher.module.scss";

type Action = "config" | "launch"

const getDialogStyling = (action: Action | null) => {
  if (action === null) return {};
  if (action === "config") {
    return {
      width: "20vw",
      aspectRatio: "4/3.25",
      borderRadius: "0.25rem"
    };
  }
  return {
    width: "calc((90vh / 9) * 16)",
    aspectRatio: "unset",
    height: "calc(90vh + 3rem)",
    maxHeight: "100vh"
  };
};

const getDialogContent = (
  project: Project | null,
  action: Action | null,
  observatories: string[],
  launch: (config: LaunchConfigT) => void,
  config: LaunchConfigT | null
) => {
  if (action === null || project === null) return null;
  if (action === "config") {
    return <LaunchConfig observatories={observatories} launch={launch}
                         project={project} sections={null} />;
  }
  return <Controller config={assert(config)} />;
};

const Projects = () => {
  const {
    action,
    setAction,
    config,
    dialog,
    isOpen
  } = useActions<Action | null>();
  const [project, setProject] = useState<Project | null>(null);
  const projects = trpc.projects.getProjects.useQuery();
  const user = trpc.getUserID.useQuery();
  const { observatories } = useObservatories();

  return projects.status === "success" && !isError(projects.data) &&
  user.status === "success" && !isError(user.data) ?
    <div style={{ position: "relative" }}>
      <section className={styles["project-container"]}>
        <h4 className={styles.heading}>Projects</h4>
        <ul className={styles.projects}>
          {projects.data.filter(x => !isError(x) && !x.isPublic)
            .map(project => {
              const formattedProject = {
                ...project,
                created: new Date(project.created),
                updated: new Date(project.updated)
              };
              return <ProjectCard key={project.id} project={formattedProject}
                                  openDialog={() => {
                                    setProject(formattedProject);
                                    setAction("config");
                                  }} user={user.data as User} />;
            })}
        </ul>
        <h4 className={styles.heading}>Public</h4>
        <ul className={styles.projects}>
          {projects.data.filter(x => !isError(x) && x.isPublic).map(project => {
            const formattedProject = {
              ...project,
              created: new Date(project.created),
              updated: new Date(project.updated)
            };
            return <ProjectCard project={formattedProject} openDialog={() => {
              setProject(formattedProject);
              setAction("config");
            }}
                                key={project.id} user={user.data as User} />;
          })}
        </ul>
        <Dialog ref={dialog} closeDialog={() => setAction(null)}
                title="Launcher"
                style={getDialogStyling(action)}
                hiddenStyle={{ padding: action === "launch" ? 0 : "1rem" }}>
          {getDialogContent(project, action, Object.keys(observatories),
            (config: LaunchConfigT) => setAction("launch", config),
            config)}
        </Dialog>
        {isOpen || action !== null ?
          <div id={styles["mask"]}></div> : null}
      </section>
      <a href="/project-editor" id={styles["new"]}><Plus size={"2rem"} /></a>
    </div> : null;
};

export default Projects;
