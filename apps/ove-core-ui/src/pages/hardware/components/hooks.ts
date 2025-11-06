import { api } from "../../../utils/api";
import { isError } from "@ove/ove-types";
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
    if (getStatus.status !== "success" && getStatus.status !== "error") {
      return null;
    }
    if (getStatus.status === "error" || isError(getStatus.data.response) || isError(getStatus.data.response.status)) {
      return "error";
    }
    return getStatus.data.response.status;
  }, [deviceId, getStatus.status, getStatus.data?.response]);
};
