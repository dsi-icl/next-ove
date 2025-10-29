import { isError } from "@ove/ove-types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../../../utils/api";
import { env, logger } from "../../../../env";
import { useStatus } from "../hooks";

export const useBrowserConfig = (
  bridgeId: string,
  deviceId: string,
  displayId: number,
) => {
  const getBrowserConfig = api.hardware.getBrowserConfig.useQuery({
    bridgeId,
    deviceId,
  });

  return useMemo((): string => {
    if (getBrowserConfig.status !== "success") return "";
    const res = getBrowserConfig.data.response;
    if (isError(res)) return "";
    return res[displayId];
  }, [getBrowserConfig.status, getBrowserConfig.data?.response, displayId]);
};

export const useBrowser = (
  bridgeId: string,
  deviceId: string,
  displayId: number,
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
        ({ displayId: id }) => id === displayId,
      )?.url ?? ""
    );
  }, [getBrowsers.status, getBrowsers.data?.response, displayId]);
};

export const useLiveFeed = (
  bridgeId: string,
  deviceId: string,
  displayId: number,
) => {
  const status = useStatus(deviceId, bridgeId);
  const takeScreenshot = api.hardware.screenshot.useMutation({ retry: false });
  const [cache, setCache] = useState<string | undefined>(undefined);

  const screenshot = useMemo(() => {
    if (takeScreenshot.status !== "success" && takeScreenshot.status !== "error")
      return cache;
    if (takeScreenshot.status === "error") {
      setCache(undefined);
      return undefined;
    }
    const res = takeScreenshot.data.response;
    if (isError(res)) {
      setCache(undefined);
      return undefined;
    }
    setCache(res[0]);
    return res[0];
  }, [takeScreenshot.status, takeScreenshot.data?.response]);

  const fn = useCallback(() => {
    takeScreenshot
      .mutateAsync({
        bridgeId,
        deviceId,
        method: "response",
        screens: [displayId],
      })
      .catch(logger.error);
  }, [bridgeId, deviceId, displayId]);

  useEffect(() => {
    if (env.DISABLE_LIVE_PREVIEW || status !== "on") return;
    const interval = setInterval(fn, env.LIVE_FEED_REFRESH_INTERVAL);
    fn();

    return () => {
      clearInterval(interval);
    };
  }, [fn, status]);

  return screenshot;
};
