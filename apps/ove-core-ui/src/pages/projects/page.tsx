import { api } from "../../utils/api";
import { assert } from "@ove/ove-utils";
import { isError } from "@ove/ove-types";
import ProjectCard from "./project-card";
import { PlusCircle } from "lucide-react";
import { useObservatories } from "../../hooks";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Dialog } from "@ove/ui-base-components";
import type { Project, User } from "@prisma/client";
import Controller from "../../components/controller/controller";
import LaunchConfig from "../../components/launch-config/launch-config";
import type { LaunchConfig as LaunchConfigT } from "../project-editor/hooks";

import styles from "./projects.module.scss";

type Action = "config" | "launch"

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
  const [action, setAction] = useState<"config" | "launch" | null>(null);
  const [config, setConfig] = useState<LaunchConfigT | null>(null);
  const [open, setOpen] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const projects = api.projects.getProjects.useQuery();
  const user = api.getUserID.useQuery({});
  const { observatories } = useObservatories();
  const projectsLoaded = useMemo(() => projects.status === "success" && !isError(projects.data) && user.status === "success" && !isError(user.data), [user.status, user.data, projects.status, projects.data]);
  const privateProjects = useMemo(() => projects.data !== undefined && !isError(projects.data) ? projects.data.filter(x => !isError(x) && !x.isPublic).map(formatProject) : [], [projects.data]);
  const publicProjects = useMemo(() => projects.data !== undefined && !isError(projects.data) ? projects.data.filter(x => !isError(x) && x.isPublic).map(formatProject) : [], [projects.data]);

  const openConfig = useCallback((project: Project) => {
    setProject(project);
    setAction("config");
  }, [setProject, setAction]);

  useEffect(() => {
    console.log("Open:", open);
  }, [open]);

  return <Dialog open={open} onOpenChange={setOpen}>;
    <main>
      <h1
        className="width-full text-center font-bold text-2xl mt-2">Projects</h1>
      {projectsLoaded ?
        <div className={styles["main"]} style={{ position: "relative" }}>
          <section className={styles["project-container"]}>
            <h4 className={styles.heading}>Private</h4>
            <ul className={styles.projects}>
              {privateProjects.map(project =>
                <ProjectCard key={project.id} project={project} openConfig={openConfig} user={user.data as User} />)}
            </ul>
            <h4 className={styles.heading}>Public</h4>
            <ul className={styles.projects}>
              {publicProjects.map(project =>
                <ProjectCard project={project} openConfig={openConfig} key={project.id} user={user.data as User} />)}
            </ul>
          </section>
          {!open ? <a href="/project-editor"
             className="fixed ml-auto bottom-8 right-8 p-2 rounded-[50%] text-white z-[100] bg-[#002147]"><PlusCircle /></a> : null}
        </div> : null}
      {open ? getDialogContent(project, action, Object.keys(observatories), (config: LaunchConfigT) => {
        setConfig(config);
        setAction("launch");
      }, config) : null}
    </main>
  </Dialog>;
};

export default Projects;
