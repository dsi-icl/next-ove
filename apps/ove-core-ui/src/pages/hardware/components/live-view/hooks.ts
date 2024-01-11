import { useEffect } from "react";
import { trpc } from "../../../../utils/api";
import { logger } from "../../../../env";

export const useStreams = (bridgeId: string, isOpen: boolean) => {
  const streams = trpc.bridge.getStreams.useQuery({ bridgeId });
  const startStreams = trpc.bridge.startStreams.useMutation();
  const stopStreams = trpc.bridge.stopStreams.useMutation();

  useEffect(() => () => {
    stopStreams.mutateAsync({ bridgeId }).catch(logger.error);
  }, [bridgeId, stopStreams]);

  useEffect(() => {
    if (isOpen) {
      startStreams.mutateAsync({ bridgeId }).catch(logger.error);
    } else {
      stopStreams.mutateAsync({ bridgeId }).catch(logger.error);
    }
  }, [isOpen, bridgeId, startStreams, stopStreams]);

  return streams;
};
