import { toast } from "sonner";
import { assert } from "@ove/ove-utils";
import { api } from "../../../../utils/api";
import React, { useMemo, useState } from "react";
import ScreenshotDisplay from "./screenshot-display";
import ScreenshotConfig, { type TransferMethod } from "./screenshot-config";

type ScreenshotProps = {
  closeDialog: () => void;
  deviceId: string | null;
  bridgeId: string;
  tags?: string[];
  deviceIds?: string[];
};

const useTakeScreenshots = (
  setScreenshots: (
    screenshots: {
      deviceId: string;
      response: string[];
    }[],
  ) => void,
  closeDialog: () => void,
  deviceId: string | null,
  bridgeId: string,
  tags?: string[],
  deviceIds?: string[],
) => {
  const takeScreenshots = api.hardware.screenshot.useMutation({
    retry: false,
    onError: () => {
      closeDialog();
    },
    onSuccess: (response) => {
      setScreenshots([{ deviceId: assert(deviceId), response }]);
    },
  });
  const takeScreenshotsAll = api.hardware.screenshotAll.useMutation({
    retry: false,
    onError: () => {
      closeDialog();
    },
    onSuccess: (responses) => {
      setScreenshots(
        responses.map(({ deviceId, response }) => {
          if (response.status !== "success") return undefined;
          return { deviceId, response: response.data };
        }).filter(Boolean) as { deviceId: string; response: string[] }[],
      );
    },
  });

  if (deviceId === null) {
    return (screens: number[], method: TransferMethod) =>
      toast.promise(
        takeScreenshotsAll.mutateAsync({
          bridgeId,
          tags,
          deviceIds,
          screens,
          method,
        }),
        {
          loading: "Taking screenshots...",
          success: "Screenshots taken",
          error: "Unable to take screenshots",
        },
      );
  }
  return (screens: number[], method: TransferMethod) =>
    toast.promise(
      takeScreenshots.mutateAsync({
        bridgeId,
        deviceId,
        screens,
        method,
      }),
      {
        loading: "Taking screenshots...",
        success: "Screenshots taken",
        error: "Unable to take screenshots",
      },
    );
};

const useDisplays = (
  deviceId: string | null,
  bridgeId: string,
  tags?: string[],
  deviceIds?: string[],
) => {
  const getDisplayConfig = api.hardware.getBrowserConfig.useQuery(
    {
      bridgeId,
      deviceId: deviceId ?? "",
    },
    { enabled: deviceId !== null },
  );
  const getDisplayConfigAll = api.hardware.getBrowserConfigAll.useQuery(
    {
      bridgeId,
      tags,
      deviceIds,
    },
    { enabled: deviceId === null },
  );

  return useMemo(() => {
    if (deviceId === null) {
      if (getDisplayConfigAll.status !== "success")
        return [];
      const xs = getDisplayConfigAll.data.filter(
        ({ response }) => response.status !== "error",
      );
      const allIds = new Set(
        xs.flatMap(({ response }) => Object.keys(response).map(parseInt)),
      );
      return Array.from(allIds).map((x) => ({
        value: x,
        label: `Screen ${x}`,
      }));
    } else {
      if (getDisplayConfig.status !== "success")
        return [];
      return Object.keys(getDisplayConfig.data).map((x) => ({
        value: parseInt(x),
        label: `Screen ${x}`,
      }));
    }
  }, [
    deviceId,
    getDisplayConfigAll.status,
    getDisplayConfig.status,
    getDisplayConfigAll.data,
    getDisplayConfig.data,
  ]);
};

const Screenshot = ({
  closeDialog,
  deviceId,
  bridgeId,
  tags,
  deviceIds,
}: ScreenshotProps) => {
  const [screenshots, setScreenshots] = useState<
    {
      deviceId: string;
      response: string[];
    }[] | null
  >(null);
  const [selectedMethod, setSelectedMethod] = useState<TransferMethod>("local");
  const takeScreenshots = useTakeScreenshots(
    setScreenshots,
    closeDialog,
    deviceId,
    bridgeId,
    tags,
    deviceIds,
  );
  const displays = useDisplays(deviceId, bridgeId, tags, deviceIds);
  return screenshots === null ? (
    <ScreenshotConfig
      displays={displays}
      method={selectedMethod}
      takeScreenshots={takeScreenshots}
      setMethod={setSelectedMethod}
    />
  ) : (
    <ScreenshotDisplay
      screenshots={screenshots}
      deviceId={deviceId}
      transferMethod={assert(selectedMethod)}
    />
  );
};

export default Screenshot;
