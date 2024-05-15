import ProjectEditor from "./page";
import { useProject, useSave } from "./hooks";
import { useQuery } from "../../hooks";
import { trpc } from "../../utils/api";
import { isError } from "@ove/ove-types";
import React, { useMemo } from "react";

const Loader = () => {
  const query = useQuery();
  const user = trpc.getUserID.useQuery();

  const userId = useMemo(() => user.status === "success" &&
  !isError(user.data) ? user.data.id : null, [user.status, user.data]);

  const {
    project,
    updateProject,
    tags
  } = useProject(userId, query.get("project"));

  const { saveProject } = useSave();

  return project === null || userId === null ? null :
    <ProjectEditor project={project} updateProject={updateProject}
                   tags={tags} saveProject={saveProject} />;
};

export default Loader;
