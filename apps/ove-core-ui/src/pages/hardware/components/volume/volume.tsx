import React from "react";
import ValueModal from "../value-modal/value-modal";
import { useStore } from "../../../../store";
import { trpc } from "../../../../utils/api";
import { isError } from "@ove/ove-types";
import { toast } from "sonner";
import { checkErrors } from "../../utils";
import { logger } from "../../../../env";
import { assert } from "@ove/ove-utils";

const useVolume = (bridgeId: string, deviceId: string | null) => {
  const setVolume = trpc.hardware.setVolume.useMutation({
    retry: false,
    onSuccess: ({ response }) => {
      if (isError(response)) {
        toast.error(`Unable to set volume on ${deviceId}`);
        return;
      }

      toast.info(`Set volume on ${deviceId}`);
    },
    onError: () => toast.error(`Unable to set volume on ${deviceId}`)
  });
  const setVolumeAll = trpc.hardware.setVolumeAll.useMutation({
    retry: false,
    onSuccess: ({ response }) => {
      if (isError(response)) {
        toast.error("Unable to set volume on devices");
        return;
      }

      checkErrors({
        data: response,
        onSuccess: () => toast.info("Set volume on devices"),
        onError: ({ deviceId }) =>
          toast.error(`Unable to set volume on ${deviceId}`)
      });
    },
    onError: () => toast.error("Unable to set volume on devices")
  });

  if (deviceId === null) {
    return {
      setVolume: (volume: number) => void setVolumeAll.mutateAsync({
        bridgeId,
        volume
      }).catch(logger.error)
    };
  }
  return {
    setVolume: (volume: number) => void setVolume.mutateAsync({
      bridgeId,
      deviceId,
      volume
    }).catch(logger.error)
  };
};

const Volume = () => {
  const reset = useStore(state => state.hardwareConfig.reset);
  const deviceAction = useStore(state =>
    state.hardwareConfig.deviceAction);
  const { setVolume } =
    useVolume(assert(deviceAction.bridgeId), deviceAction.deviceId);

  const onSubmit = ({ volume }: { volume: string }) => {
    setVolume(parseInt(volume));
    reset();
  };

  return <ValueModal k="volume" label="Volume" header="Enter Volume:"
                     onSubmit={onSubmit} />;
};

export default Volume;
