import { isError } from "@ove/ove-types";
import { useEffect, useMemo } from "react";
import { api } from "../../../../utils/api";
import { env, logger } from "../../../../env";

export const useWindowConfig = (
  bridgeId: string,
  deviceId: string,
  displayId: string,
) => {
  const getWindowConfig = api.hardware.getWindowConfig.useQuery({
    bridgeId,
    deviceId,
  });

  return useMemo((): string => {
    if (getWindowConfig.status !== "success") return "";
    const res = getWindowConfig.data.response;
    if (isError(res)) return "";
    return res[displayId];
  }, [getWindowConfig.status, getWindowConfig.data?.response, displayId]);
};

export const useBrowser = (
  bridgeId: string,
  deviceId: string,
  displayId: string,
) => {
  const getBrowsers = api.hardware.getBrowsers.useQuery({
    bridgeId,
    deviceId,
  });

  return useMemo((): string => {
    if (getBrowsers.status !== "success") return "";
    const res = getBrowsers.data.response;
    if (isError(res)) return "";
    return (
      Array.from(Object.values(res)).find(
        ({ displayId: id }) => id === parseInt(displayId),
      )?.url ?? ""
    );
  }, [getBrowsers.status, getBrowsers.data?.response, displayId]);
};

export const useLiveFeed = (
  bridgeId: string,
  deviceId: string,
  displayId: string,
) => {
  const takeScreenshot = api.hardware.screenshot.useMutation({ retry: false });

  const screenshot = useMemo(() => {
    if (takeScreenshot.status !== "success")
      return takeScreenshot.status === "pending"
        ? ("loading" as const)
        : undefined;
    const res = takeScreenshot.data.response;
    if (isError(res)) return undefined;
    return res[0];
  }, [takeScreenshot.status, takeScreenshot.data?.response]);

  useEffect(() => {
    takeScreenshot
      .mutateAsync({
        bridgeId,
        deviceId,
        method: "response",
        screens: [parseInt(displayId)],
      })
      .catch(logger.error);
    // only to run on initial render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      takeScreenshot
        .mutateAsync({
          bridgeId,
          deviceId,
          method: "response",
          screens: [parseInt(displayId)],
        })
        .catch(logger.error);
    }, env.LIVE_FEED_REFRESH_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [bridgeId, deviceId, displayId, takeScreenshot]);

  return screenshot;
};
