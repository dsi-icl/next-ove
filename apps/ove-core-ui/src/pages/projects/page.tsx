import { api } from "../../utils/api";
import { assert } from "@ove/ove-utils";
import { isError } from "@ove/ove-types";
import ProjectCard from "./project-card";
import { PlusCircle } from "lucide-react";
import { Dialog } from "@ove/ui-base-components";
import type { Project, User } from "@prisma/client";
import LaunchConfig, {
  type TLaunchConfig
} from "../../components/launch-config/launch-config";
import React, { useCallback, useMemo, useState } from "react";
import Controller from "../../components/controller/controller";

type Action = "config" | "launch"

const getDialogContent = (
  project: Project | null,
  action: Action | null,
  launch: (config: TLaunchConfig) => void,
  config: TLaunchConfig | null
) => {
  if (action === null || project === null) return null;
  if (action === "config") {
    return <LaunchConfig launch={launch} project={project} />;
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
  const [config, setConfig] = useState<TLaunchConfig | null>(null);
  const [open, setOpen] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const projects = api.projects.getProjects.useQuery();
  const user = api.getUserID.useQuery({});
  const projectsLoaded = useMemo(() => projects.status === "success" && !isError(projects.data) && user.status === "success" && !isError(user.data), [user.status, user.data, projects.status, projects.data]);
  const privateProjects = useMemo(() => projects.data !== undefined && !isError(projects.data) ? projects.data.filter(x => !isError(x) && !x.isPublic).map(formatProject) : [], [projects.data]);
  const publicProjects = useMemo(() => projects.data !== undefined && !isError(projects.data) ? projects.data.filter(x => !isError(x) && x.isPublic).map(formatProject) : [], [projects.data]);

  const openConfig = useCallback((project: Project) => {
    setProject(project);
    setAction("config");
  }, [setProject, setAction]);

  return <Dialog open={open} onOpenChange={setOpen}>
    <main>
      <h1
        className="width-full text-center font-bold text-2xl mt-2">Projects</h1>
      {projectsLoaded ?
        <div className="relative border-t border-t-solid border-t-white w-screen h-[calc(90vh-1px)]">
          <section className="z-0 h-full pb-16 relative">
            <h4 className="m-8 font-bold text-2xl border-b border-b-solid border-b-gray-400">Private</h4>
            <ul className="p-8 grid justify-items-center grid-cols-4">
              {privateProjects.map(project =>
                <ProjectCard key={project.id} project={project} openConfig={openConfig} user={user.data as User} />)}
            </ul>
            <h4 className="m-8 font-bold text-2xl border-b border-b-solid border-b-gray-400">Public</h4>
            <ul className="p-8 grid justify-items-center grid-cols-4">
              {publicProjects.map(project =>
                <ProjectCard project={project} openConfig={openConfig} key={project.id} user={user.data as User} />)}
            </ul>
          </section>
          {!open ? <a href="/project-editor"
             className="fixed ml-auto bottom-8 right-8 p-2 rounded-[50%] text-white z-[100] bg-[#002147]"><PlusCircle /></a> : null}
        </div> : null}
      {open ? getDialogContent(project, action, (config: TLaunchConfig) => {
        setConfig(config);
        setAction("launch");
      }, config) : null}
    </main>
  </Dialog>;
};

export default Projects;
