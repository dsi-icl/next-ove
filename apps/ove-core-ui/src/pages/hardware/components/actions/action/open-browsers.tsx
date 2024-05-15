import React from "react";
import { type ActionProps } from "../../../types";
import { WindowPlus } from "react-bootstrap-icons";
import { trpc } from "../../../../../utils/api";
import { isError } from "@ove/ove-types";
import { toast } from "sonner";
import { checkErrors } from "../../../utils";
import { logger } from "../../../../../env";

const useOpenBrowsers = (
  bridgeId: string,
  deviceId: string | null,
  tag: string | undefined
) => {
  const openBrowsers = trpc.hardware.openBrowsers.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error(`Failed to open browsers on: ${deviceId}`);
        return;
      }
      toast.message(`Open browsers on: ${deviceId}`);
    },
    onError: () => {
      toast.error(`Failed to open browsers on: ${deviceId}`);
    }
  });
  const openBrowsersAll = trpc.hardware.openBrowsersAll.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error("Failed to open browsers on devices");
        return;
      }

      checkErrors({
        data: data.response,
        onError: ({ deviceId }) =>
          toast.error(`Failed to open browsers on: ${deviceId}`),
        onSuccess: () => toast.info("Opened browsers")
      });
    },
    onError: () => toast.error("Failed to open browsers on devices")
  });

  if (deviceId === null) {
    return {
      openBrowsers: () =>
        void openBrowsersAll.mutateAsync({ bridgeId, tag }).catch(logger.error)
    };
  }
  return {
    openBrowsers: () => void openBrowsers.mutateAsync({
      bridgeId,
      deviceId
    }).catch(logger.error)
  };
};

const OpenBrowsers = ({ bridgeId, deviceId, tag }: ActionProps) => {
  const { openBrowsers } = useOpenBrowsers(bridgeId, deviceId, tag);
  return <button onClick={openBrowsers} title="open windows">
    <WindowPlus />
  </button>;
};

export default OpenBrowsers;
