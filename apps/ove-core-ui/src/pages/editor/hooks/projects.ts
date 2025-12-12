import { toast } from "sonner";
import { nanoid } from "nanoid";
import { create } from "zustand";
import { api } from "../../../utils/api";
import { useSections } from "./sections";
import { useQuery } from "../../../hooks/query";
import type { Project, User } from ".prisma/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useStore } from "../../../store";
import { env } from "../../../env";
import { useNavigate } from "react-router-dom";

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
  created_at: new Date(),
  updated_at: new Date(),
  isPublic: false,
  bucket: null,
});

export const useProjectId = () => {
  const query = useQuery();
  const defaultProjectId = useStore((store) => store.defaultProjectId);
  return useMemo(() => query.get("project") ?? defaultProjectId, [query]);
};

export const useSave = () => {
  const navigate = useNavigate();
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
    try {
      if (project.title === "") {
        toast.error("Cannot save project without title");
        return;
      }
      if (project.id.length === 32) {
        const res = await createProject.mutateAsync({
          project: {
            title: project.title,
            description: project.description,
            notes: project.notes,
            thumbnail: project.thumbnail,
            publications: project.publications,
            presenterNotes: project.presenterNotes,
            tags: project.tags,
            isPublic: project.isPublic,
          },
          layout: layout.map((x) => {
            const { id: _id, projectId: _projectId, ...data } = x;
            return data;
          }),
        });
        const updatedProject = {
          ...project,
          ...res.project,
          created_at: new Date(res.project.created_at),
          updated_at: new Date(res.project.updated_at),
        };
        setProject((cur) => ({ ...cur, ...updatedProject }));
        navigate(`?project=${res.project.id}`, { replace: true });
        toast.success("Successfully created project!");
        return;
      }
      saveProject
        .mutateAsync({
          project: {
            ...project,
            created_at: project.created_at.toISOString(),
            updated_at: project.updated_at.toISOString(),
          },
          layout,
        })
        .then(() => toast.success("Successfully saved project!"))
        .catch(() => toast.error("Error saving project"));
    } catch (e) {
      toast.error("Error saving project");
    }
  }, [project, layout, createProject, saveProject, setProject, navigate]);
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
    if (getProject.status !== "success" || getProject.data === null) return;
    setProject({
      ...getProject.data,
      created_at: new Date(getProject.data.created_at),
      updated_at: new Date(getProject.data.updated_at),
    });
    setIsLoading(false);
  }, [setProject, setIsLoading, getProject.status, getProject.data]);

  useEffect(() => {
    if (
      projectId.length !== env.CONSTANTS.NEW_PROJECT_ID_LENGTH ||
      user === null
    )
      return;
    setProject(loadNewProject(user.id));
    setIsLoading(false);
  }, [projectId, user, setProject]);

  return isLoading;
};

type ProjectStore = {
  project: Omit<Project, "isDeleted">;
  setProject: (arg: Omit<Project, "isDeleted"> | ((cur: Omit<Project, "isDeleted">) => Omit<Project, "isDeleted">)) => void;
};

export const useProjectStore = create<ProjectStore>((set) => ({
  project: loadNewProject("PLACEHOLDER"),
  setProject: (arg) =>
    set((state) => ({
      project: typeof arg === "function" ? arg(state.project) : arg,
    })),
}));
