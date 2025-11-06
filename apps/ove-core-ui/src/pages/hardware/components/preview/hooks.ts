import { isError } from "@ove/ove-types";
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
    const res = getBrowserConfig.data.response;
    if (isError(res) || res.type !== "node" || isError(res.browserConfigs) || res.browserConfigs === null) return "";
    return res.browserConfigs[displayId];
  }, [getBrowserConfig.status, getBrowserConfig.data?.response, displayId]);
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
    const res = getBrowsers.data.response;
    if (isError(res) || res.type !== "node" || isError(res.browsers) || res.browsers === null) return "";
    return (
      Array.from(Object.values(res.browsers)).find(
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
    const res = getLiveUpdate.data.response;
    if (isError(res) || res.type !== "node" || isError(res.screenshots)) {
      setCache(null);
      return null;
    }
    setCache(res.screenshots?.[displayId] ?? null);
    return res.screenshots?.[displayId] ?? null;
  }, [getLiveUpdate.status, getLiveUpdate.data?.response]);
};
