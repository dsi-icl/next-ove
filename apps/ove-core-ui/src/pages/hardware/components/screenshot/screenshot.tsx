import { toast } from "sonner";
import { assert } from "@ove/ove-utils";
import { isError } from "@ove/ove-types";
import { logger } from "../../../../env";
import { api } from "../../../../utils/api";
import React, { useMemo, useState } from "react";
import ScreenshotDisplay from "./screenshot-display";
import ScreenshotConfig, { type TransferMethod } from "./screenshot-config";

type ScreenshotProps = {
  closeDialog: () => void;
  deviceId: string | null;
  bridgeId: string;
  tag?: string;
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
  tag?: string,
) => {
  const takeScreenshots = api.hardware.screenshot.useMutation({
    retry: false,
    onError: () => {
      toast.error("Unable to take screenshots");
      closeDialog();
    },
    onSuccess: ({ response }) => {
      if (isError(response)) {
        toast.error("Unable to take screenshots");
        closeDialog();
        return;
      }
      setScreenshots([{ deviceId: assert(deviceId), response }]);
    },
  });
  const takeScreenshotsAll = api.hardware.screenshotAll.useMutation({
    retry: false,
    onError: () => {
      toast.error("Unable to take screenshots");
      closeDialog();
    },
    onSuccess: ({ response }) => {
      if (isError(response)) {
        toast.error("Unable to take screenshots");
        closeDialog();
        return;
      }

      setScreenshots(
        response.filter(({ deviceId, response }) => {
          if (isError(response)) {
            toast.error(`Unable to take screenshots on ${deviceId}`);
            return false;
          }
          return true;
        }) as { deviceId: string; response: string[] }[],
      );
    },
  });

  if (deviceId === null) {
    return (screens: number[], method: TransferMethod) =>
      takeScreenshotsAll
        .mutateAsync({
          bridgeId,
          tag,
          screens,
          method,
        })
        .catch(logger.error);
  }
  return (screens: number[], method: TransferMethod) =>
    takeScreenshots
      .mutateAsync({
        bridgeId,
        deviceId,
        screens,
        method,
      })
      .catch(logger.error);
};

const useDisplays = (
  deviceId: string | null,
  bridgeId: string,
  tag?: string,
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
      tag,
    },
    { enabled: deviceId === null },
  );

  return useMemo(() => {
    if (deviceId === null) {
      if (
        getDisplayConfigAll.status !== "success" ||
        isError(getDisplayConfigAll.data.response)
      )
        return [];
      const xs = getDisplayConfigAll.data.response.filter(
        ({ response }) => !isError(response),
      );
      const allIds = new Set(xs.flatMap(
        ({ response }) =>
          Object.keys(response).map(parseInt))
      );
      return Array.from(allIds).map((x) => ({value: x, label: `Screen ${x}`}));
    } else {
      if (
        getDisplayConfig.status !== "success" ||
        isError(getDisplayConfig.data.response)
      )
        return [];
      return Object.keys(getDisplayConfig.data.response).map((x) => ({value: parseInt(x), label: `Screen ${x}`}));
    }
  }, [
    deviceId,
    getDisplayConfigAll.status,
    getDisplayConfig.status,
    getDisplayConfigAll.data?.response,
    getDisplayConfig.data?.response,
  ]);
};

const Screenshot = ({
  closeDialog,
  deviceId,
  bridgeId,
  tag,
}: ScreenshotProps) => {
  const [state, setState] = useState<"config" | "display">("config");
  const [screenshots, setScreenshots] = useState<
    {
      deviceId: string;
      response: string[];
    }[]
  >([]);
  const [selectedMethod, setSelectedMethod] = useState<TransferMethod>("local");
  const takeScreenshots = useTakeScreenshots(
    setScreenshots,
    closeDialog,
    deviceId,
    bridgeId,
    tag,
  );
  const displays = useDisplays(deviceId, bridgeId, tag);
  return state === "config" ? (
    <ScreenshotConfig
      displays={displays}
      method={selectedMethod}
      takeScreenshots={takeScreenshots}
      transition={() => setState("display")}
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
