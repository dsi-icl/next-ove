import { trpc } from "../../../../utils/api";
import { useEffect } from "react";

export const useStreams = (bridgeId: string, isOpen: boolean) => {
  const streams = trpc.bridge.getStreams.useQuery({bridgeId});
  const startStreams = trpc.bridge.startStreams.useMutation();
  const stopStreams = trpc.bridge.stopStreams.useMutation();

  useEffect(() => {
    if (isOpen) {
      startStreams.mutateAsync({bridgeId});
    } else {
      stopStreams.mutateAsync({bridgeId});
    }
  }, [isOpen]);

  return streams;
};