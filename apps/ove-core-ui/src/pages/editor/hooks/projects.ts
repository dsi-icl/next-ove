import { toast } from "sonner";
import { nanoid } from "nanoid";
import { create } from "zustand";
import { api } from "../../../utils/api";
import { isError } from "@ove/ove-types";
import { useSections } from "./sections";
import { useQuery } from "../../../hooks/query";
import type { Project, User } from ".prisma/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useStore } from "../../../store";
import { env } from "../../../env";

const loadNewProject = (username: string) => ({
  id: nanoid(32),
  title: "",
  description: "",
  notes: "",
  publications: [],
  tags: [],
  presenterNotes: "",
  creatorId: username,
  thumbnail: null,
  created: new Date(),
  updated: new Date(),
  isPublic: false,
  bucket: null,
});

export const useProjectId = () => {
  const query = useQuery();
  const defaultProjectId = useStore((store) => store.defaultProjectId);
  return useMemo(
    () => query.get("project") ?? defaultProjectId,
    [query],
  );
};

export const useSave = () => {
  const saveProject = api.projects.saveProject.useMutation({
    retry: false,
  });
  const createProject = api.projects.createProject.useMutation({
    retry: false,
  });
  const setProject = useProjectStore((state) => state.setProject);
  const project = useProjectStore((state) => state.project);
  const { all: layout } = useSections();

  return useCallback(async () => {
    if (project.title === "") {
      toast.error("Cannot save project without title");
      return;
    }
    if (project.id.length === 32) {
      const res = await createProject.mutateAsync({
        project: { title: project.title },
        layout: layout.map((x) => {
          const { id: _id, projectId: _projectId, ...data } = x;
          return data;
        }),
      });
      if (isError(res)) {
        toast.error("Error creating project");
        return;
      }
      const updatedProject = {
        ...project,
        ...res.project,
        created: new Date(res.project.created),
        updated: new Date(res.project.updated),
      };
      setProject((cur) => ({ ...cur, ...updatedProject }));
    }
    saveProject
      .mutateAsync({
        project: {
          ...project,
          created: project.created.toISOString(),
          updated: project.updated.toISOString(),
        },
        layout,
      })
      .then(() => toast.success("Successfully saved project!"))
      .catch(() => toast.error("Error saving project"));
  }, [project, layout, createProject, saveProject, setProject]);
};

export const useInitProject = (user: Omit<User, "password"> | null) => {
  const projectId = useProjectId();
  const getProject = api.projects.getProject.useQuery(
    { projectId: projectId ?? "ERROR" },
    { enabled: projectId !== null },
  );
  const setProject = useProjectStore((state) => state.setProject);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (
      getProject.status !== "success" ||
      isError(getProject.data) ||
      getProject.data === null
    )
      return;
    setProject({
      ...getProject.data,
      created: new Date(getProject.data.created),
      updated: new Date(getProject.data.updated),
    });
    setIsLoading(false);
  }, [setProject, setIsLoading, getProject.status, getProject.data]);

  useEffect(() => {
    if (projectId.length !== env.CONSTANTS.NEW_PROJECT_ID_LENGTH || user === null) return;
    setProject(loadNewProject(user.id));
    setIsLoading(false);
  }, [projectId, user, setProject]);

  return isLoading;
};

type ProjectStore = {
  project: Project;
  setProject: (arg: Project | ((cur: Project) => Project)) => void;
};

export const useProjectStore = create<ProjectStore>((set) => ({
  project: loadNewProject("PLACEHOLDER"),
  setProject: (arg) =>
    set((state) => ({
      project: typeof arg === "function" ? arg(state.project) : arg,
    })),
}));
