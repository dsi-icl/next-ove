import { api } from "../../../utils/api";
import { logger } from "../../../env";
import { useMemo } from "react";

export const useInvites = () => {
  const invites = api.projects.getCollaborationInvites.useQuery();
  const getSentInvites = api.projects.getSentInvites.useQuery();
  const apiUtils = api.useUtils();
  const acceptInvite = api.projects.acceptInvite.useMutation({
    onSuccess: () => {
      apiUtils.projects.getCollaborationInvites
        .invalidate()
        .catch(logger.error);
      apiUtils.projects.getPendingInviteCount.invalidate().catch(logger.error);
    },
  });
  const declineInvite = api.projects.declineInvite.useMutation({
    onSuccess: () => {
      apiUtils.projects.getCollaborationInvites
        .invalidate()
        .catch(logger.error);
      apiUtils.projects.getPendingInviteCount.invalidate().catch(logger.error);
    },
  });

  const pending = useMemo(() => {
    if (invites.status !== "success") return [];
    return invites.data.filter((invite) => invite.status === "pending");
  }, [invites.status, invites.data]);

  const accepted = useMemo(() => {
    if (invites.status !== "success") return [];
    return invites.data.filter((invite) => invite.status === "accepted");
  }, [invites.status, invites.data]);

  const declined = useMemo(() => {
    if (invites.status !== "success") return [];
    return invites.data.filter((invite) => invite.status === "declined");
  }, [invites.status, invites.data]);

  const sent = useMemo(() => {
    if (getSentInvites.status !== "success") return [];
    return getSentInvites.data;
  }, [getSentInvites.status, getSentInvites.data]);

  return {
    accepted,
    pending,
    declined,
    acceptInvite,
    declineInvite,
    sent,
    isLoaded: invites.status === "success",
  };
};
