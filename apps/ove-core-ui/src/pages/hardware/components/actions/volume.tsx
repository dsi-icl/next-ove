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

const useVolume = (
  closeDialog: () => void,
  deviceId: string | null,
  bridgeId: string,
  tags?: string[],
  deviceIds?: string[],
) => {
  const setVolume = api.hardware.setVolume.useMutation({
    onError: () => closeDialog(),
    onSuccess: () => closeDialog(),
  });

  const setVolumeAll = api.hardware.setVolumeAll.useMutation({
    onError: () => closeDialog(),
    onSuccess: () => closeDialog(),
  });

  if (deviceId === null) {
    return (volume: number) =>
      toast.promise(
        setVolumeAll.mutateAsync({
          bridgeId,
          tags,
          deviceIds,
          volume,
        }),
        {
          loading: "Setting volume...",
          success: "Volume set",
          error: "Unable to set volume",
        },
      );
  }
  return (volume: number) =>
    toast.promise(
      setVolume.mutateAsync({
        bridgeId,
        deviceId,
        volume,
      }),
      {
        loading: "Setting volume...",
        success: "Volume set",
        error: "Unable to set volume",
      },
    );
};

type VolumeProps = {
  closeDialog: () => void;
  deviceId: string | null;
  bridgeId: string;
  tags?: string[];
  deviceIds?: string[];
};

const Volume = ({
  closeDialog,
  deviceId,
  bridgeId,
  tags,
  deviceIds,
}: VolumeProps) => {
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const trigger = useVolume(closeDialog, deviceId, bridgeId, tags, deviceIds);

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
