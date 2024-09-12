import { useEffect } from "react";
import { logger } from "../../../../env";
import { api } from "../../../../utils/api";

export const useStreams = (bridgeId: string, isOpen: boolean) => {
  const streams = api.bridge.getStreams.useQuery({ bridgeId });
  const startStreams = api.bridge.startStreams.useMutation();
  const stopStreams = api.bridge.stopStreams.useMutation();

  useEffect(() => () => {
    stopStreams.mutateAsync({ bridgeId }).catch(logger.error);
  }, [bridgeId, stopStreams.mutateAsync]);

  useEffect(() => {
    if (isOpen) {
      startStreams.mutateAsync({ bridgeId }).catch(logger.error);
    } else {
      stopStreams.mutateAsync({ bridgeId }).catch(logger.error);
    }
  }, [isOpen, bridgeId, startStreams.mutateAsync, stopStreams.mutateAsync]);

  return streams;
};
