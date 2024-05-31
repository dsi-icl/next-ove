import React from "react";
import { toast } from "sonner";
import { isError } from "@ove/ove-types";
import { logger } from "../../../../../env";
import { checkErrors } from "../../../utils";
import { trpc } from "../../../../../utils/api";
import { WindowX } from "react-bootstrap-icons";
import type { ActionProps } from "../../../types";

const useBrowsers = (
  bridgeId: string,
  deviceId: string | null,
  tag: string | undefined
) => {
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
        void closeBrowsersAll.mutateAsync({ bridgeId, tag }).catch(logger.error)
    };
  }
  return {
    closeBrowsers: () => void closeBrowsers.mutateAsync({
      bridgeId,
      deviceId
    }).catch(logger.error)
  };
};

const CloseBrowsers = ({ bridgeId, deviceId, tag }: ActionProps) => {
  const { closeBrowsers } = useBrowsers(bridgeId, deviceId, tag);
  return <button onClick={closeBrowsers} title="close windows">
    <WindowX />
  </button>;
};

export default CloseBrowsers;
