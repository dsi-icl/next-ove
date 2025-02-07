import React from "react";
import ProjectEditor from "./page";
import { useUser } from "./hooks/user";
import { useInitProject } from "./hooks/projects";
import { useInitSections } from "./hooks/sections";

const Loader = () => {
  const user = useUser();

  const loadingProject = useInitProject(user);
  const loadingSections = useInitSections();

  return user === null || loadingProject || loadingSections ? null : <ProjectEditor />;
};

export default Loader;
