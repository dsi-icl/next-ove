import { useMemo, useState } from "react";
import { api } from "../../../../utils/api";

export const useBrowserConfig = (
  bridgeId: string,
  deviceId: string,
  displayId: number,
) => {
  const getBrowserConfig = api.hardware.getLiveUpdate.useQuery({
    bridgeId,
    deviceId,
  });

  return useMemo((): string => {
    if (getBrowserConfig.status !== "success") return "";
    if (getBrowserConfig.data.type !== "node" || getBrowserConfig.data.browserConfigs === null) return "";
    return getBrowserConfig.data.browserConfigs[displayId];
  }, [getBrowserConfig.status, getBrowserConfig.data, displayId]);
};

export const useBrowser = (
  bridgeId: string,
  deviceId: string,
  displayId: number,
) => {
  const getBrowsers = api.hardware.getLiveUpdate.useQuery({
    bridgeId,
    deviceId,
  });

  return useMemo((): string => {
    if (getBrowsers.status !== "success") return "";
    if (getBrowsers.data.type !== "node" || getBrowsers.data.browsers === null) return "";
    return (
      Array.from(Object.values(getBrowsers.data.browsers)).find(
        ({ displayId: id }) => id === displayId,
      )?.url ?? ""
    );
  }, [getBrowsers.status, getBrowsers.data, displayId]);
};

export const useLiveFeed = (
  bridgeId: string,
  deviceId: string,
  displayId: number,
) => {
  const getLiveUpdate = api.hardware.getLiveUpdate.useQuery({
    bridgeId,
    deviceId,
  });
  const [cache, setCache] = useState<string | null>(null);

  return useMemo(() => {
    if (getLiveUpdate.status !== "success" && getLiveUpdate.status !== "error")
      return cache;
    if (getLiveUpdate.status === "error") {
      setCache(null);
      return null;
    }
    if (getLiveUpdate.data.type !== "node") {
      setCache(null);
      return null;
    }
    setCache(getLiveUpdate.data.screenshots?.[displayId] ?? null);
    return getLiveUpdate.data.screenshots?.[displayId] ?? null;
  }, [getLiveUpdate.status, getLiveUpdate.data]);
};
