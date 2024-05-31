import { z } from "zod";
import React from "react";
import { toast } from "sonner";
import { assert } from "@ove/ove-utils";
import { isError } from "@ove/ove-types";
import { logger } from "../../../../env";
import { checkErrors } from "../../utils";
import { trpc } from "../../../../utils/api";
import { useStore } from "../../../../store";
import ValueModal from "../value-modal/value-modal";

const useVolume = (
  bridgeId: string,
  deviceId: string | null,
  tag: string | undefined
) => {
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
        volume,
        tag
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

const VolumeFormSchema = z.strictObject({
  volume: z.number()
});

type VolumeForm = z.infer<typeof VolumeFormSchema>

const Volume = () => {
  const reset = useStore(state => state.hardwareConfig.reset);
  const deviceAction = useStore(state =>
    state.hardwareConfig.deviceAction);
  const { setVolume } = useVolume(
    assert(deviceAction.bridgeId), deviceAction.deviceId, deviceAction.tag);

  const onSubmit = ({ volume }: VolumeForm) => {
    setVolume(volume);
    reset();
  };

  return <ValueModal k="volume" label="Volume" header="Enter Volume:"
                     onSubmit={onSubmit} schema={VolumeFormSchema} />;
};

export default Volume;
