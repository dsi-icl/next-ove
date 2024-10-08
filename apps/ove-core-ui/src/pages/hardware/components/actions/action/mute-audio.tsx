import React from "react";
import { toast } from "sonner";
import { isError } from "@ove/ove-types";
import { logger } from "../../../../../env";
import { checkErrors } from "../../../utils";
import { api } from "../../../../../utils/api";
import type { ActionProps } from "../../../types";
import { Mic, VolumeMute } from "react-bootstrap-icons";

import styles from "../actions.module.scss";

const useMuteAudio = (
  bridgeId: string,
  deviceId: string | null,
  tag: string | undefined
) => {
  const muteAudio = api.hardware.muteAudio.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error(`Failed to mute audio on: ${deviceId}`);
        return;
      }
      toast.message(`Muted audio on: ${deviceId}`);
    },
    onError: () => {
      toast.error(`Failed to mute audio on: ${deviceId}`);
    }
  });
  const muteAudioAll = api.hardware.muteAudioAll.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error("Failed to mute audio on devices");
        return;
      }

      checkErrors({
        data: data.response,
        onError: ({ deviceId }) =>
          toast.error(`Failed to mute audio on: ${deviceId}`),
        onSuccess: () => toast.info("Muted audio on devices")
      });
    },
    onError: () => toast.error("Failed to mute audio on devices")
  });

  if (deviceId === null) {
    return {
      muteAudio: () =>
        void muteAudioAll.mutateAsync({ bridgeId, tag }).catch(logger.error)
    };
  }
  return {
    muteAudio: () => void muteAudio.mutateAsync({
      bridgeId,
      deviceId
    }).catch(logger.error)
  };
};

const MuteAudio = ({ bridgeId, deviceId, tag }: ActionProps) => {
  const { muteAudio } = useMuteAudio(bridgeId, deviceId, tag);
  return <button onClick={muteAudio} title="mute audio"
                 className={styles.composite}>
    <Mic className={styles.primary} />
    <VolumeMute size="40%" className={styles.secondary} />
  </button>;
};

export default MuteAudio;
