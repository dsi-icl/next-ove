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
  const getDisplayInfo = api.hardware.getInfo.useQuery(
    {
      bridgeId,
      deviceId: deviceId ?? "",
      type: "graphics",
    },
    { enabled: deviceId !== null },
  );
  const getDisplayInfoAll = api.hardware.getInfoAll.useQuery(
    {
      bridgeId,
      tag,
      type: "graphics",
    },
    { enabled: deviceId === null },
  );

  return useMemo(() => {
    if (deviceId === null) {
      if (
        getDisplayInfoAll.status !== "success" ||
        isError(getDisplayInfoAll.data.response)
      )
        return [];
      const xs = getDisplayInfoAll.data.response.filter(
        ({ response }) => !isError(response),
      );
      const lengths = xs.map(
        ({ response }) =>
          (
            response as {
              graphics: { displays: unknown[] };
            }
          ).graphics.displays.length,
      );
      return Array.from({ length: Math.max(...lengths) }).map((_x, i) => ({
        value: i + 1,
        label: `Screen ${i + 1}`,
      }));
    } else {
      if (
        getDisplayInfo.status !== "success" ||
        isError(getDisplayInfo.data.response)
      )
        return [];
      return (
        getDisplayInfo.data.response as {
          graphics: { displays: unknown[] };
        }
      ).graphics.displays.map((_x, i) => ({ value: i, label: `Screen ${i}` }));
    }
  }, [
    deviceId,
    getDisplayInfoAll.status,
    getDisplayInfo.status,
    getDisplayInfoAll.data?.response,
    getDisplayInfo.data?.response,
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
