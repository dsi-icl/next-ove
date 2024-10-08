import React from "react";
import { toast } from "sonner";
import { isError } from "@ove/ove-types";
import { logger } from "../../../../../env";
import { checkErrors } from "../../../utils";
import { api } from "../../../../../utils/api";
import { VolumeUp } from "react-bootstrap-icons";
import type { ActionProps } from "../../../types";

const useUnmute = (
  bridgeId: string,
  deviceId: string | null,
  tag: string | undefined
) => {
  const unmute = api.hardware.unmute.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error(`Failed to unmute: ${deviceId}`);
        return;
      }
      toast.message(`Unmuted: ${deviceId}`);
    },
    onError: () => {
      toast.error(`Failed to unmute: ${deviceId}`);
    }
  });
  const unmuteAll = api.hardware.unmuteAll.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error("Failed to unmute devices");
        return;
      }

      checkErrors({
        data: data.response,
        onError: ({ deviceId }) => toast.error(`Failed to unmute: ${deviceId}`),
        onSuccess: () => toast.info("Unmuted devices")
      });
    },
    onError: () => toast.error("Failed to unmute devices")
  });

  if (deviceId === null) {
    return {
      unmute: () =>
        void unmuteAll.mutateAsync({ bridgeId, tag }).catch(logger.error)
    };
  }
  return {
    unmute: () => void unmute.mutateAsync({
      bridgeId,
      deviceId
    }).catch(logger.error)
  };
};

const Unmute = ({ bridgeId, deviceId, tag }: ActionProps) => {
  const { unmute } = useUnmute(bridgeId, deviceId, tag);
  return <button onClick={unmute} title="unmute">
    <VolumeUp />
  </button>;
};

export default Unmute;
