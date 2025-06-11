import React from "react";
import ProjectEditor from "./page";
import { useInitProject } from "./hooks/projects";
import { useInitSections } from "./hooks/sections";
import { useStore } from "../../store";

const Loader = () => {
  const user = useStore((state) => state.user);

  const loadingProject = useInitProject(user);
  const loadingSections = useInitSections();

  return user === null || loadingProject || loadingSections ? null : (
    <ProjectEditor />
  );
};

export default Loader;
