import { api } from "../../utils/api";
import { assert } from "@ove/ove-utils";
import React, { useMemo, useState } from "react";
import { isError } from "@ove/ove-types";
import { PlusCircle } from "lucide-react";
import ProjectCard from "./project-card";
import { Dialog } from "@ove/ui-components";
import type { Project, User } from "@prisma/client";
import { useActions, useObservatories } from "../../hooks";
import Controller from "../../components/controller/controller";
import LaunchConfig from "../../components/launch-config/launch-config";
import type { LaunchConfig as LaunchConfigT } from "../project-editor/hooks";

import styles from "./projects.module.scss";

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

const formatProject = (project: Omit<Project, "created" | "updated"> & {
  created: string,
  updated: string
}) => ({
  ...project,
  created: new Date(project.created),
  updated: new Date(project.updated)
});

const Projects = () => {
  const {
    action,
    setAction,
    config,
    dialog,
    isOpen
  } = useActions<Action | null>();
  const [project, setProject] = useState<Project | null>(null);
  const projects = api.projects.getProjects.useQuery();
  const user = api.getUserID.useQuery({});
  const { observatories } = useObservatories();
  const projectsLoaded = useMemo(() => projects.status === "success" && !isError(projects.data) && user.status === "success" && !isError(user.data), [user.status, user.data, projects.status, projects.data]);
  const privateProjects = useMemo(() => projects.data !== undefined && !isError(projects.data) ? projects.data.filter(x => !isError(x) && !x.isPublic).map(formatProject) : [], [projects.data]);
  const publicProjects = useMemo(() => projects.data !== undefined && !isError(projects.data) ? projects.data.filter(x => !isError(x) && x.isPublic).map(formatProject) : [], [projects.data]);

  return <main>
    <h1 className="width-full text-center font-bold text-2xl mt-2">Projects</h1>
    {projectsLoaded ?
      <div className={styles["main"]} style={{ position: "relative" }}>
        <section className={styles["project-container"]}>
          <h4 className={styles.heading}>Private</h4>
          <ul className={styles.projects}>
            {privateProjects.map(project =>
              <ProjectCard key={project.id} project={project}
                           openDialog={() => {
                             setProject(project);
                             setAction("config");
                           }} user={user.data as User} />)}
          </ul>
          <h4 className={styles.heading}>Public</h4>
          <ul className={styles.projects}>
            {publicProjects.map(project =>
              <ProjectCard project={project} openDialog={() => {
                setProject(project);
                setAction("config");
              }}
                           key={project.id} user={user.data as User} />)}
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
        <a href="/project-editor"
           className="fixed ml-auto bottom-8 right-8 p-2 rounded-[50%] text-white z-[100] bg-[#002147]"><PlusCircle /></a>
      </div> : null}
  </main>;
};

export default Projects;
