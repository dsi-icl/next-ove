import { api } from "../../../utils/api";
import { isError } from "@ove/ove-types";
import { env, logger } from "../../../env";
import { useEffect, useMemo } from "react";

export const useStatus = (deviceId: string | null, bridgeId: string) => {
  const apiUtils = api.useUtils();
  const getStatus = api.hardware.getStatus.useQuery(
    {
      bridgeId,
      deviceId: deviceId ?? "",
    },
    { enabled: deviceId !== null },
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (deviceId === null) return;
      apiUtils.hardware.getStatus
        .invalidate({ bridgeId, deviceId })
        .catch(logger.error);
    }, env.STATUS_REFRESH_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [bridgeId, deviceId, apiUtils.hardware.getStatus]);

  return useMemo(() => {
    if (deviceId === null) return null;
    if (getStatus.status === "pending") return "pending";
    if (getStatus.status === "error" || isError(getStatus.data.response)) {
      return "error";
    }
    return getStatus.data.response;
  }, [deviceId, getStatus.status, getStatus.data?.response]);
};
