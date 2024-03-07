import React from "react";
import { toast } from "sonner";
import { isError } from "@ove/ove-types";
import { logger } from "../../../../../env";
import { checkErrors } from "../../../utils";
import { trpc } from "../../../../../utils/api";
import { ArrowClockwise } from "react-bootstrap-icons";

const useReboot = (bridgeId: string, deviceId: string | null) => {
  const reboot = trpc.hardware.reboot.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error(`Failed to reboot: ${deviceId}`);
        return;
      }
      toast.message(`Rebooted: ${deviceId}`);
    },
    onError: () => {
      toast.error(`Failed to reboot: ${deviceId}`);
    }
  });
  const rebootAll = trpc.hardware.rebootAll.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error("Failed to reboot devices");
        return;
      }

      checkErrors({
        data: data.response,
        onError: ({ deviceId }) => toast.error(`Failed to reboot: ${deviceId}`),
        onSuccess: () => toast.info("Rebooted devices")
      });
    },
    onError: () => toast.error("Failed to reboot devices")
  });

  if (deviceId === null) {
    return {
      reboot: () =>
        void rebootAll.mutateAsync({ bridgeId }).catch(logger.error)
    };
  }
  return {
    reboot: () => void reboot.mutateAsync({
      bridgeId,
      deviceId
    }).catch(logger.error)
  };
};

const Reboot = ({ bridgeId, deviceId }: {
  bridgeId: string,
  deviceId: string | null
}) => {
  const { reboot } = useReboot(bridgeId, deviceId);
  return <button onClick={reboot} title="reboot">
    <ArrowClockwise />
  </button>;
};

export default Reboot;
