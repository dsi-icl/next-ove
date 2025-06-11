import { api } from "../../../utils/api";
import { logger } from "../../../env";
import { useMemo } from "react";
import { isError } from "@ove/ove-types";

export const useCollaborators = (project: {creatorId: string, id: string}) => {
  const apiUtils = api.useUtils();
  const getCollaborators = api.projects.getCollaboratorsForProject.useQuery({projectId: project.id});
  const getUsers = api.projects.getUsers.useQuery();
  const inviteCollaborator_ = api.projects.inviteCollaborator.useMutation({
    onSuccess: () => {
      apiUtils.projects.getCollaboratorsForProject.invalidate({projectId: project.id}).catch(logger.error);
      apiUtils.projects.getUsers.invalidate().catch(logger.error);
    }
  });
  const removeCollaborator_ = api.projects.removeCollaborator.useMutation({
    onSuccess: () => {
      apiUtils.projects.getCollaboratorsForProject.invalidate({projectId: project.id}).catch(logger.error);
      apiUtils.projects.getUsers.invalidate().catch(logger.error);
    }
  });

  const collaborators = useMemo(() => {
    if (getCollaborators.status !== "success" || isError(getCollaborators.data)) return [];
    return getCollaborators.data;
  }, [getCollaborators.status, getCollaborators.data]);

  const users = useMemo(() => {
    if (getUsers.status !== "success" || isError(getUsers.data)) return [];
    return getUsers.data.filter(({id}) => collaborators.find(c => c.id === id) === undefined);
  }, [getUsers.status, getUsers.data, collaborators]);

  const inviteCollaborator = (id: string) => {
    inviteCollaborator_.mutateAsync(
      { projectId: project.id, collaboratorId: id }).catch(logger.error);
  };

  const removeCollaborator = (id: string) => {
    if (id === project.creatorId) return;
    removeCollaborator_.mutateAsync(
      { projectId: project.id, collaboratorId: id }).catch(logger.error);
    apiUtils.projects.getCollaboratorsForProject.invalidate({projectId: project.id}).catch(logger.error);
    apiUtils.projects.getUsers.invalidate().catch(logger.error);
  };

  return {
    collaborators,
    users,
    inviteCollaborator,
    removeCollaborator
  };
};