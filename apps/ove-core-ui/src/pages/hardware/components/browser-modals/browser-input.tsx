import React from "react";
import { toast } from "sonner";
import { assert } from "@ove/ove-utils";
import { isError } from "@ove/ove-types";
import { logger } from "../../../../env";
import { checkErrors } from "../../utils";
import { useForm } from "react-hook-form";
import { trpc } from "../../../../utils/api";
import { useStore } from "../../../../store";

import styles from "./browsers.module.scss";

type Form = {
  url: string
  displayId: string
}

const useBrowser = (
  bridgeId: string,
  deviceId: string | null,
  tag: string | undefined
) => {
  const openBrowser = trpc.hardware.openBrowser.useMutation({
    retry: false,
    onSuccess: ({ response }) => {
      if (isError(response)) {
        toast.error("Unable to open browser");
        return;
      }

      toast.info("Opened browser");
    },
    onError: () => toast.error("Unable to open browser")
  });
  const openBrowserAll = trpc.hardware.openBrowserAll.useMutation({
    retry: false,
    onSuccess: ({ response }) => {
      if (isError(response)) {
        toast.error("Unable to open browsers");
        return;
      }

      checkErrors({
        data: response,
        onSuccess: () => toast.info("Opened browsers"),
        onError: ({ deviceId }) =>
          toast.error(`Unable to open browser on ${deviceId}`)
      });
    },
    onError: () => toast.error("Unable to open browsers")
  });

  if (deviceId === null) {
    return {
      openBrowser: (url: string, displayId: number) =>
        void openBrowserAll.mutateAsync({
          bridgeId,
          url,
          displayId,
          tag
        }).catch(logger.error)
    };
  }
  return {
    openBrowser: (url: string, displayId: number) =>
      void openBrowser.mutateAsync({
        bridgeId,
        deviceId,
        url,
        displayId
      }).catch(logger.error)
  };
};

const BrowserIdInput = () => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const setDeviceAction = useStore(state =>
    state.hardwareConfig.setDeviceAction);
  const { openBrowser } = useBrowser(
    assert(deviceAction.bridgeId),
    deviceAction.deviceId,
    deviceAction.tag
  );
  const { handleSubmit, register } = useForm<Form>();

  const onSubmit = (config: Form) => {
    openBrowser(config.url, parseInt(config.displayId));
    setDeviceAction({ ...deviceAction, pending: false });
  };

  return <div className={styles.input}>
    <h4>Browser Config:</h4>
    <form onSubmit={handleSubmit(onSubmit)}>
      <fieldset>
        <label>URL</label>
        <input {...register("url")} type="text" />
      </fieldset>
      <fieldset>
        <label>Display ID</label>
        <input {...register("displayId")} type="number" />
      </fieldset>
      <button type="submit">SUBMIT</button>
    </form>
  </div>;
};

export default BrowserIdInput;
