import { api } from "../../utils/api";
import { assert } from "@ove/ove-utils";
import { isError } from "@ove/ove-types";
import ProjectCard from "./project-card";
import { PlusCircle } from "lucide-react";
import { Dialog } from "@ove/ui-base-components";
import type { Project, User } from "@prisma/client";
import LaunchConfig, {
  type TLaunchConfig,
} from "../../components/launch-config/launch-config";
import React, { useCallback, useMemo, useState } from "react";
import Controller from "../../components/controller/controller";

type Action = "config" | "launch";

const getDialogContent = (
  project: Project | null,
  action: Action | null,
  launch: (config: TLaunchConfig) => void,
  config: TLaunchConfig | null,
) => {
  if (action === null || project === null) return null;
  if (action === "config") {
    return <LaunchConfig launch={launch} project={project} />;
  }
  return <Controller config={assert(config)} />;
};

const formatProject = (
  project: Omit<Project, "created" | "updated"> & {
    created: string;
    updated: string;
  },
) => ({
  ...project,
  created: new Date(project.created),
  updated: new Date(project.updated),
});

const Projects = () => {
  const [action, setAction] = useState<"config" | "launch" | null>(null);
  const [config, setConfig] = useState<TLaunchConfig | null>(null);
  const [open, setOpen] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const projects = api.projects.getProjects.useQuery();
  const user = api.getUserID.useQuery({});
  const projectsLoaded = useMemo(
    () =>
      projects.status === "success" &&
      !isError(projects.data) &&
      user.status === "success" &&
      !isError(user.data),
    [user.status, user.data, projects.status, projects.data],
  );
  const privateProjects = useMemo(
    () =>
      projects.data !== undefined && !isError(projects.data)
        ? projects.data
            .filter((x) => !isError(x) && !x.isPublic)
            .map(formatProject)
        : [],
    [projects.data],
  );
  const publicProjects = useMemo(
    () =>
      projects.data !== undefined && !isError(projects.data)
        ? projects.data
            .filter((x) => !isError(x) && x.isPublic)
            .map(formatProject)
        : [],
    [projects.data],
  );

  const openConfig = useCallback(
    (project: Project) => {
      setProject(project);
      setAction("config");
    },
    [setProject, setAction],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <main>
        <h1 className="mt-2 w-full text-center text-2xl font-bold">Projects</h1>
        {projectsLoaded ? (
          <div className="relative h-[calc(90vh-1px)] w-screen border-t border-solid border-t-white">
            <section className="relative z-0 h-full pb-16">
              <h4 className="m-8 border-b border-solid border-b-gray-400 text-2xl font-bold">
                Private
              </h4>
              <ul className="grid grid-cols-4 justify-items-center p-8">
                {privateProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    openConfig={openConfig}
                    user={user.data as User}
                  />
                ))}
              </ul>
              <h4 className="m-8 border-b border-solid border-b-gray-400 text-2xl font-bold">
                Public
              </h4>
              <ul className="grid grid-cols-4 justify-items-center p-8">
                {publicProjects.map((project) => (
                  <ProjectCard
                    project={project}
                    openConfig={openConfig}
                    key={project.id}
                    user={user.data as User}
                  />
                ))}
              </ul>
            </section>
            {!open ? (
              <a
                href="/project-editor"
                className="fixed bottom-8 right-8 z-[100] ml-auto rounded-[50%] bg-[#002147] p-2 text-white"
              >
                <PlusCircle />
              </a>
            ) : null}
          </div>
        ) : null}
        {open
          ? getDialogContent(
              project,
              action,
              (config: TLaunchConfig) => {
                setConfig(config);
                setAction("launch");
              },
              config,
            )
          : null}
      </main>
    </Dialog>
  );
};

export default Projects;
