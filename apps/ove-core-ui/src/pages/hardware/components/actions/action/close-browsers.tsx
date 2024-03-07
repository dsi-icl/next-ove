import { trpc } from "../../../../../utils/api";
import { isError } from "@ove/ove-types";
import { toast } from "sonner";
import { checkErrors } from "../../../utils";
import { logger } from "../../../../../env";
import { useStore } from "../../../../../store";
import { WindowX } from "react-bootstrap-icons";
import React from "react";

const useBrowsers = (bridgeId: string, deviceId: string | null) => {
  const closeBrowsers = trpc.hardware.closeBrowsers.useMutation({
    retry: false,
    onSuccess: ({ response }) => {
      if (isError(response)) {
        toast.error("Unable to close browsers");
        return;
      }

      toast.info("Closed browsers");
    },
    onError: () => toast.error("Unable to close browsers")
  });
  const closeBrowsersAll = trpc.hardware.closeBrowsersAll.useMutation({
    retry: false,
    onSuccess: ({ response }) => {
      if (isError(response)) {
        toast.error("Unable to close browsers");
        return;
      }

      checkErrors({
        data: response,
        onSuccess: () => toast.info("Closed browsers"),
        onError: ({ deviceId }) =>
          toast.error(`Unable to close browsers on ${deviceId}`)
      });
    },
    onError: () => toast.error("Unable to close browsers")
  });

  if (deviceId === null) {
    return {
      closeBrowsers: () =>
        void closeBrowsersAll.mutateAsync({ bridgeId }).catch(logger.error)
    };
  }
  return {
    closeBrowsers: () => void closeBrowsers.mutateAsync({
      bridgeId,
      deviceId
    }).catch(logger.error)
  };
};

const CloseBrowsers = ({ bridgeId, deviceId }: {
  bridgeId: string,
  deviceId: string | null
}) => {
  const setDeviceAction =
    useStore(state => state.hardwareConfig.setDeviceAction);
  const { closeBrowsers } = useBrowsers(bridgeId, deviceId);
  return <button onClick={() => {
    closeBrowsers();
    setDeviceAction({
      bridgeId,
      action: "browsers_close",
      deviceId: deviceId,
      pending: false
    });
  }} title="close windows">
    <WindowX />
  </button>;
};

export default CloseBrowsers;
