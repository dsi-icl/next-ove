import React from "react";
import { toast } from "sonner";
import { isError } from "@ove/ove-types";
import { logger } from "../../../../../env";
import { checkErrors } from "../../../utils";
import { trpc } from "../../../../../utils/api";
import { VolumeMute } from "react-bootstrap-icons";

const useMute = (bridgeId: string, deviceId: string | null) => {
  const mute = trpc.hardware.mute.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error(`Failed to mute: ${deviceId}`);
        return;
      }
      toast.message(`Muted: ${deviceId}`);
    },
    onError: () => {
      toast.error(`Failed to mute: ${deviceId}`);
    }
  });
  const muteAll = trpc.hardware.muteAll.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error("Failed to mute devices");
        return;
      }

      checkErrors({
        data: data.response,
        onError: ({ deviceId }) => toast.error(`Failed to mute: ${deviceId}`),
        onSuccess: () => toast.info("Muted devices")
      });
    },
    onError: () => toast.error("Failed to mute devices")
  });

  if (deviceId === null) {
    return {
      mute: () =>
        void muteAll.mutateAsync({ bridgeId }).catch(logger.error)
    };
  }
  return {
    mute: () => void mute.mutateAsync({
      bridgeId,
      deviceId
    }).catch(logger.error)
  };
};

const Mute = ({ bridgeId, deviceId }: {
  bridgeId: string,
  deviceId: string | null
}) => {
  const { mute } = useMute(bridgeId, deviceId);
  return <button onClick={mute} title="mute">
    <VolumeMute />
  </button>;
};

export default Mute;
