import ProjectEditor from "./page";
import { useQuery } from "../../hooks";
import { api } from "../../utils/api";
import React, { useMemo } from "react";
import { isError } from "@ove/ove-types";
import { useProject, useSave } from "./hooks";

const Loader = ({ token }: { token: string }) => {
  const query = useQuery();
  const user = api.getUserID.useQuery();

  const userId = useMemo(() => user.status === "success" &&
  !isError(user.data) ? user.data.id : null, [user.status, user.data]);

  const {
    project,
    updateProject,
    tags,
    createProject
  } = useProject(userId, query.get("project"));

  const { saveProject } = useSave(createProject);

  return project === null || userId === null ? null :
    <ProjectEditor project={project} updateProject={updateProject}
                   tags={tags} saveProject={saveProject} token={token} />;
};

export default Loader;
