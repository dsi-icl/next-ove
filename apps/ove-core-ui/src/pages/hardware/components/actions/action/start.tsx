import React from "react";
import { toast } from "sonner";
import { isError } from "@ove/ove-types";
import { checkErrors } from "../../../utils";
import { logger } from "../../../../../env";
import { api } from "../../../../../utils/api";
import type { ActionProps } from "../../../types";
import { PlayCircle } from "react-bootstrap-icons";

const useStart = (
  bridgeId: string,
  deviceId: string | null,
  tag: string | undefined
) => {
  const start = api.hardware.start.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error(`Failed to start: ${deviceId}`);
        return;
      }
      toast.message(`Started: ${deviceId}`);
    },
    onError: () => {
      toast.error(`Failed to start: ${deviceId}`);
    }
  });
  const startAll = api.hardware.startAll.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error("Failed to start devices");
        return;
      }

      checkErrors({
        data: data.response,
        onError: ({ deviceId }) => toast.error(`Failed to start: ${deviceId}`),
        onSuccess: () => toast.info("Started devices")
      });
    },
    onError: () => toast.error("Failed to start devices")
  });

  if (deviceId === null) {
    return {
      start: () =>
        void startAll.mutateAsync({ bridgeId, tag }).catch(logger.error)
    };
  }
  return {
    start: () => void start.mutateAsync({
      bridgeId,
      deviceId: deviceId
    }).catch(logger.error)
  };
};

const Start = ({ bridgeId, deviceId, tag }: ActionProps) => {
  const { start } = useStart(bridgeId, deviceId, tag);
  return <button onClick={start} title="start">
    <PlayCircle />
  </button>;
};

export default Start;
