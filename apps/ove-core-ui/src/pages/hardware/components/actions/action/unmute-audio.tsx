import React from "react";
import { toast } from "sonner";
import { isError } from "@ove/ove-types";
import { logger } from "../../../../../env";
import { checkErrors } from "../../../utils";
import { trpc } from "../../../../../utils/api";
import { type ActionProps } from "../../../types";
import { Mic, VolumeUp } from "react-bootstrap-icons";

import styles from "../actions.module.scss";

const useUnmuteAudio = (
  bridgeId: string,
  deviceId: string | null,
  tag: string | undefined
) => {
  const unmuteAudio = trpc.hardware.unmuteAudio.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error(`Failed to unmute audio on: ${deviceId}`);
        return;
      }
      toast.message(`Unmuted audio on: ${deviceId}`);
    },
    onError: () => {
      toast.error(`Failed to unmute audio on: ${deviceId}`);
    }
  });
  const unmuteAudioAll = trpc.hardware.unmuteAudioAll.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error("Failed to unmute audio on devices");
        return;
      }

      checkErrors({
        data: data.response,
        onError: ({ deviceId }) =>
          toast.error(`Failed to unmute audio on: ${deviceId}`),
        onSuccess: () => toast.info("Unmuted audio on devices")
      });
    },
    onError: () => toast.error("Failed to unmute audio on devices")
  });

  if (deviceId === null) {
    return {
      unmuteAudio: () =>
        void unmuteAudioAll.mutateAsync({ bridgeId, tag }).catch(logger.error)
    };
  }
  return {
    unmuteAudio: () => void unmuteAudio.mutateAsync({
      bridgeId,
      deviceId
    }).catch(logger.error)
  };
};

const UnmuteAudio = ({ bridgeId, deviceId, tag }: ActionProps) => {
  const { unmuteAudio } = useUnmuteAudio(bridgeId, deviceId, tag);
  return <button onClick={unmuteAudio} title="unmute audio"
                 className={styles.composite}>
    <Mic className={styles.primary} />
    <VolumeUp size="40%" className={styles.secondary} />
  </button>;
};

export default UnmuteAudio;
