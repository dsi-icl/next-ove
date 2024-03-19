import { z } from "zod";
import React from "react";
import { toast } from "sonner";
import { assert } from "@ove/ove-utils";
import { isError } from "@ove/ove-types";
import { logger } from "../../../../env";
import { checkErrors } from "../../utils";
import { trpc } from "../../../../utils/api";
import { useStore } from "../../../../store";
import ValueModal from "../value-modal/value-modal";

const useBrowser = (
  bridgeId: string,
  deviceId: string | null,
  tag: string | undefined
) => {
  const closeBrowser = trpc.hardware.closeBrowser.useMutation({
    retry: false,
    onSuccess: ({ response }) => {
      if (isError(response)) {
        toast.error(`Unable to close browser on ${deviceId ?? ""}`);
        return;
      }

      toast.info(`Closed browser on ${deviceId ?? ""}`);
    },
    onError: () => toast.error(`Unable to close browser on ${deviceId ?? ""}`)
  });
  const closeBrowserAll = trpc.hardware.closeBrowserAll.useMutation({
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
          toast.error(`Unable to close browser on ${deviceId}`)
      });
    },
    onError: () => toast.error("Unable to close browsers")
  });

  if (deviceId === null) {
    return {
      closeBrowser: (browserId: number) => void closeBrowserAll.mutateAsync({
        bridgeId,
        browserId,
        tag
      }).catch(logger.error)
    };
  }
  return {
    closeBrowser: (browserId: number) => void closeBrowser.mutateAsync({
      bridgeId,
      deviceId,
      browserId
    }).catch(logger.error)
  };
};

const BrowserIdFormSchema = z.strictObject({
  browserId: z.string()
});

type BrowserIdForm = z.infer<typeof BrowserIdFormSchema>

const BrowserIdInput = () => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const setDeviceAction = useStore(state =>
    state.hardwareConfig.setDeviceAction);
  const setBrowserId = useStore(state => state.hardwareConfig.setBrowserId);
  const { closeBrowser } = useBrowser(
    assert(deviceAction.bridgeId),
    deviceAction.deviceId,
    deviceAction.tag
  );

  const onSubmit = ({ browserId }: BrowserIdForm) => {
    if (deviceAction.action === "browser_close") {
      closeBrowser(parseInt(browserId));
    } else {
      setBrowserId(parseInt(browserId));
    }
    setDeviceAction({ ...deviceAction, pending: false });
  };

  return <ValueModal k="browserId" label="Browser ID"
                     schema={BrowserIdFormSchema}
                     header="Get Browser Status For:" onSubmit={onSubmit} />;
};

export default BrowserIdInput;
