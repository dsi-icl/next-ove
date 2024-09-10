import React from "react";
import { toast } from "sonner";
import { isError } from "@ove/ove-types";
import { logger } from "../../../../../env";
import { checkErrors } from "../../../utils";
import { api } from "../../../../../utils/api";
import type { ActionProps } from "../../../types";
import { CameraVideo, VolumeUp } from "react-bootstrap-icons";

import styles from "../actions.module.scss";

const useUnmuteVideo = (
  bridgeId: string,
  deviceId: string | null,
  tag: string | undefined
) => {
  const unmuteVideo = api.hardware.unmuteVideo.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error(`Failed to unmute video on: ${deviceId}`);
        return;
      }
      toast.message(`Unmuted video on: ${deviceId}`);
    },
    onError: () => {
      toast.error(`Failed to unmute video on: ${deviceId}`);
    }
  });
  const unmuteVideoAll = api.hardware.unmuteVideoAll.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error("Failed to unmute video on devices");
        return;
      }

      checkErrors({
        data: data.response,
        onError: ({ deviceId }) =>
          toast.error(`Failed to unmute video on: ${deviceId}`),
        onSuccess: () => toast.info("Unmuted video on devices")
      });
    },
    onError: () => toast.error("Failed to unmute video on devices")
  });

  if (deviceId === null) {
    return {
      unmuteVideo: () =>
        void unmuteVideoAll.mutateAsync({ bridgeId, tag }).catch(logger.error)
    };
  }
  return {
    unmuteVideo: () => void unmuteVideo.mutateAsync({
      bridgeId,
      deviceId
    }).catch(logger.error)
  };
};

const UnmuteVideo = ({ bridgeId, deviceId, tag }: ActionProps) => {
  const { unmuteVideo } = useUnmuteVideo(bridgeId, deviceId, tag);
  return <button onClick={unmuteVideo} title="unmute video"
                 className={styles.composite}>
    <CameraVideo className={styles.primary} />
    <VolumeUp size="40%" className={styles.secondary} />
  </button>;
};

export default UnmuteVideo;
