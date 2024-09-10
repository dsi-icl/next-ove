import React from "react";
import { toast } from "sonner";
import { isError } from "@ove/ove-types";
import { logger } from "../../../../../env";
import { checkErrors } from "../../../utils";
import { api } from "../../../../../utils/api";
import type { ActionProps } from "../../../types";
import { CameraVideo, VolumeMute } from "react-bootstrap-icons";

import styles from "../actions.module.scss";

const useMuteVideo = (
  bridgeId: string,
  deviceId: string | null,
  tag: string | undefined
) => {
  const muteVideo = api.hardware.muteVideo.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error(`Failed to mute video on: ${deviceId}`);
        return;
      }
      toast.message(`Muted video on: ${deviceId}`);
    },
    onError: () => {
      toast.error(`Failed to mute video on: ${deviceId}`);
    }
  });
  const muteVideoAll = api.hardware.muteVideoAll.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error("Failed to mute video on devices");
        return;
      }

      checkErrors({
        data: data.response,
        onError: ({ deviceId }) =>
          toast.error(`Failed to mute video on: ${deviceId}`),
        onSuccess: () => toast.info("Muted video on devices")
      });
    },
    onError: () => toast.error("Failed to mute video on devices")
  });

  if (deviceId === null) {
    return {
      muteVideo: () =>
        void muteVideoAll.mutateAsync({ bridgeId, tag }).catch(logger.error)
    };
  }
  return {
    muteVideo: () => void muteVideo.mutateAsync({
      bridgeId,
      deviceId
    }).catch(logger.error)
  };
};

const MuteVideo = ({ bridgeId, deviceId, tag }: ActionProps) => {
  const { muteVideo } = useMuteVideo(bridgeId, deviceId, tag);
  return <button onClick={muteVideo} title="mute video"
                 className={styles.composite}>
    <CameraVideo className={styles.primary} />
    <VolumeMute size="40%" className={styles.secondary} />
  </button>;
};

export default MuteVideo;
