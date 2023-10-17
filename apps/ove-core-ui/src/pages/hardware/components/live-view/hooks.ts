import { useEffect } from "react";
import { trpc } from "../../../../utils/api";

export const useStreams = (bridgeId: string) => {
  const streams = trpc.bridge.getStreams.useQuery({ bridgeId });
  const startStreams = trpc.bridge.startStreams.useMutation();
  const stopStreams = trpc.bridge.stopStreams.useMutation();

  useEffect(() => {
    startStreams.mutateAsync({ bridgeId });
    return () => void stopStreams.mutateAsync({ bridgeId });
  }, []);

  return streams;
};