import { api } from "../../../utils/api";
import { isError } from "@ove/ove-types";
import { toast } from "sonner";
import { logger } from "../../../env";
import { useMemo } from "react";

export const useInvites = () => {
  const invites = api.projects.getCollaborationInvites.useQuery();
  const apiUtils = api.useUtils();
  const acceptInvite = api.projects.acceptInvite.useMutation({
    onSuccess: data => {
      if (isError(data)) {
        toast.error("Unable to accept invitation");
      } else {
        toast.success("Accepted invitation");
        apiUtils.projects.getCollaborationInvites.invalidate().catch(logger.error);
        apiUtils.projects.getPendingInviteCount.invalidate().catch(logger.error);
      }
    },
    onError: () => toast.error("Unable to accept invitation")
  });
  const declineInvite = api.projects.declineInvite.useMutation({
    onSuccess: data => {
      if (isError(data)) {
        toast.error("Unable to decline invitation");
      } else {
        toast.success("Declined invitation");
        apiUtils.projects.getCollaborationInvites.invalidate().catch(logger.error);
        apiUtils.projects.getPendingInviteCount.invalidate().catch(logger.error);
      }
    },
    onError: () => toast.error("Unable to decline invitation")
  });

  const pending = useMemo(() => {
    if (invites.status !== "success" || isError(invites.data)) return [];
    return invites.data.filter(invite => invite.status === "pending");
  }, [invites.status, invites.data]);

  const accepted = useMemo(() => {
    if (invites.status !== "success" || isError(invites.data)) return [];
    return invites.data.filter(invite => invite.status === "accepted");
  }, [invites.status, invites.data]);

  const declined = useMemo(() => {
    if (invites.status !== "success" || isError(invites.data)) return [];
    return invites.data.filter(invite => invite.status === "declined");
  }, [invites.status, invites.data]);

  return {
    accepted,
    pending,
    declined,
    acceptInvite,
    declineInvite,
    isLoaded: invites.status === "success" && !isError(invites.data)
  };
};
