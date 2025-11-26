import { api } from "../../../utils/api";
import { useMemo } from "react";

export const useStatus = (deviceId: string | null, bridgeId: string) => {
  const getStatus = api.hardware.getLiveUpdate.useQuery(
    {
      bridgeId,
      deviceId: deviceId ?? "ERROR",
    },
    { enabled: deviceId !== null }
  );

  return useMemo(() => {
    if (deviceId === null) return null;
    if (getStatus.status === "error") {
      return "error";
    }
    if (getStatus.status !== "success") {
      return null;
    }

    return getStatus.data.status;
  }, [deviceId, getStatus.status, getStatus.data]);
};
