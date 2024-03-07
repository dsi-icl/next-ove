import React from "react";
import { toast } from "sonner";
import { isError } from "@ove/ove-types";
import { checkErrors } from "../../../utils";
import { logger } from "../../../../../env";
import { trpc } from "../../../../../utils/api";
import { StopCircle } from "react-bootstrap-icons";

const useShutdown = (bridgeId: string, deviceId: string | null) => {
  const shutdown = trpc.hardware.shutdown.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error(`Failed to shutdown: ${deviceId}`);
        return;
      }
      toast.message(`Shutdown: ${deviceId}`);
    },
    onError: () => {
      toast.error(`Failed to shutdown: ${deviceId}`);
    }
  });
  const shutdownAll = trpc.hardware.shutdownAll.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error("Failed to shutdown devices");
        return;
      }

      checkErrors({
        data: data.response,
        onError: ({ deviceId }) =>
          toast.error(`Failed to shutdown: ${deviceId}`),
        onSuccess: () => toast.info("Shutdown devices")
      });
    },
    onError: () => toast.error("Failed to shutdown devices")
  });

  if (deviceId === null) {
    return {
      shutdown: () =>
        void shutdownAll.mutateAsync({ bridgeId }).catch(logger.error)
    };
  }
  return {
    shutdown: () => void shutdown.mutateAsync({
      bridgeId,
      deviceId
    }).catch(logger.error)
  };
};

const Shutdown = ({ bridgeId, deviceId }: {
  bridgeId: string,
  deviceId: string | null
}) => {
  const { shutdown } = useShutdown(bridgeId, deviceId);
  return <button onClick={shutdown} title="shutdown">
    <StopCircle />
  </button>;
};

export default Shutdown;
