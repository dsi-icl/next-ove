import {
  Button,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Slider,
} from "@ove/ui-base-components";
import { Volume2, VolumeX } from "lucide-react";
import { SliderRange, SliderThumb, SliderTrack } from "@radix-ui/react-slider";
import React, { useCallback, useState } from "react";
import { api } from "../../../../utils/api";
import { toast } from "sonner";
import { isError } from "@ove/ove-types";
import { logger } from "../../../../env";

const useVolume = (
  closeDialog: () => void,
  deviceId: string | null,
  bridgeId: string,
  tag?: string,
) => {
  const setVolume = api.hardware.setVolume.useMutation({
    retry: false,
    onError: () => {
      toast.error("Unable to set volume");
      closeDialog();
    },
    onSuccess: ({ response }) => {
      if (isError(response)) {
        toast.error("Unable to set volume");
        closeDialog();
        return;
      }

      toast.info("Successfully set volume");
      closeDialog();
    },
  });

  const setVolumeAll = api.hardware.setVolumeAll.useMutation({
    retry: false,
    onError: () => {
      toast.error("Unable to set volume");
      closeDialog();
    },
    onSuccess: ({ response }) => {
      if (isError(response)) {
        toast.error("Unable to set volume");
        closeDialog();
        return;
      }

      const errors = response.filter(({ response }) => isError(response));

      if (errors.length === 0) {
        toast.info("Successfully set volume");
      } else {
        errors.forEach(({ deviceId }) =>
          toast.error(`Unable to set volume on ${deviceId}`),
        );
      }
      closeDialog();
    },
  });

  if (deviceId === null) {
    return (volume: number) =>
      void setVolumeAll
        .mutateAsync({
          bridgeId,
          tag,
          volume,
        })
        .catch(logger.error);
  }
  return (volume: number) =>
    void setVolume
      .mutateAsync({
        bridgeId,
        deviceId,
        volume,
      })
      .catch(logger.error);
};

type VolumeProps = {
  closeDialog: () => void;
  deviceId: string | null;
  bridgeId: string;
  tag?: string;
};

const Volume = ({ closeDialog, deviceId, bridgeId, tag }: VolumeProps) => {
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const trigger = useVolume(closeDialog, deviceId, bridgeId, tag);

  const handleVolumeChange = useCallback(
    (newVolume: number[]) => {
      setVolume(newVolume[0]);
      setIsMuted(false);
    },
    [setVolume, setIsMuted],
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, [setIsMuted]);

  const submit = useCallback(() => {
    trigger(volume);
  }, [trigger, volume]);

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Adjust Volume</DialogTitle>
        <DialogDescription>Adjust the device volume</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX className="size-4" />
            ) : (
              <Volume2 className="size-4" />
            )}
          </Button>
          <Slider
            className="relative flex h-5 w-[200px] touch-none select-none items-center"
            defaultValue={[50]}
            value={[isMuted ? 0 : volume]}
            max={100}
            step={1}
            aria-label="Volume"
            onValueChange={handleVolumeChange}
          >
            <SliderTrack className="relative h-[3px] grow rounded-full bg-[#dadedf]">
              <SliderRange className="absolute h-full rounded-full bg-[#002147]" />
            </SliderTrack>
            <SliderThumb
              className="block size-5 rounded-full bg-[#002147] shadow-md hover:bg-[#002147]/90 focus:outline-none focus:ring-2 focus:ring-[#002147]"
              aria-label="Volume"
            />
          </Slider>
          <span className="w-12 text-center">{isMuted ? 0 : volume}%</span>
        </div>
        <div className="h-[100px] overflow-hidden rounded-md bg-[#dadedf]">
          <div
            className="h-full bg-[#002147] transition-all duration-200 ease-in-out"
            style={{ width: `${isMuted ? 0 : volume}%` }}
          ></div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={submit}>Close</Button>
      </div>
    </DialogContent>
  );
};

export default Volume;
