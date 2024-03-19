import { z } from "zod";
import { toast } from "sonner";
import { assert } from "@ove/ove-utils";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { trpc } from "../../../../utils/api";
import { useStore } from "../../../../store";
import { zodResolver } from "@hookform/resolvers/zod";
import { isError, ScreenshotMethodSchema } from "@ove/ove-types";

import styles from "./screenshot.module.scss";

const ScreenshotInputFormSchema = z.strictObject({
  method: ScreenshotMethodSchema,
  screen: z.number()
});

type ScreenshotInputForm = z.infer<typeof ScreenshotInputFormSchema>

const useScreenshot = (
  bridgeId: string,
  deviceId: string | null,
  tag?: string
) => {
  const setScreenshots = useStore(state => state.hardwareConfig.setScreenshots);
  const setScreenshotConfig = useStore(state =>
    state.hardwareConfig.setScreenshotConfig);
  const screenshot = trpc.hardware.screenshot.useMutation({
    onSuccess: ({ response }) => {
      if (isError(response)) {
        toast.error(`Unable to take screenshot on ${deviceId}`);
        return;
      }

      if (response.length === 0) {
        toast.info(`Screenshot(s) taken successfully on ${deviceId}`);
        return;
      }

      setScreenshots(response);
    },
    onError: () => toast.error(`Unable to take screenshot on ${deviceId}`)
  });
  const screenshotAll = trpc.hardware.screenshotAll.useMutation({
    onSuccess: ({ response }) => {
      if (isError(response)) {
        toast.error("Unable to take screenshots");
        return;
      }

      response.filter(({ response }) =>
        "oveError" in response).forEach(({ response }) =>
        toast.error((response as { oveError: string }).oveError));

      setScreenshots(response.filter(({ response }) =>
        !("oveError" in response)) as
        { response: string[], deviceId: string }[]);
    },
    onError: () => toast.error("Unable to take screenshots")
  });

  if (deviceId === null) {
    return {
      screenshot: (
        method: "upload" | "local" | "response",
        screens: number[]
      ) => {
        setScreenshotConfig({ method, screens });
        screenshotAll.mutateAsync({ bridgeId, tag, method, screens });
      }
    };
  }

  return {
    screenshot: (
      method: "upload" | "local" | "response",
      screens: number[]
    ) => {
      setScreenshotConfig({ method, screens });
      screenshot.mutateAsync({ bridgeId, deviceId, method, screens });
    }
  };
};

const ScreenshotInput = () => {
  const [screens, setScreens] = useState<number[]>([]);
  const { register, handleSubmit, resetField } = useForm<ScreenshotInputForm>({
    resolver: zodResolver(ScreenshotInputFormSchema)
  });
  const setDeviceAction = useStore(state =>
    state.hardwareConfig.setDeviceAction);
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const { screenshot } = useScreenshot(
    assert(deviceAction.bridgeId),
    deviceAction.deviceId,
    deviceAction.tag
  );

  const onSubmit = ({ method, screen }: ScreenshotInputForm) => {
    if (screen !== "") {
      setScreens(cur => cur.includes(screen) ? cur : [...cur, screen]);
      resetField("screen");
    } else {
      screenshot(method, screens);
      setDeviceAction({ ...deviceAction, pending: false });
    }
  };

  return <div className={styles.input}>
    <h4>Screenshot Config</h4>
    <form onSubmit={handleSubmit(onSubmit)}>
      <fieldset>
        <label htmlFor="method">Save Method</label>
        {/* TODO: should this input be required? */}
        <select {...register("method")}>
          <option value="response">Response</option>
          <option value="upload">Upload</option>
          <option value="local">Local</option>
        </select>
      </fieldset>
      <fieldset>
        <label htmlFor="screen">Screens</label>
        <ul className={styles.tags}>
          {screens.map(screen => <li key={screen}
                                     className={styles.saved}>{screen}</li>)}
          {/* TODO: should this input be required? */}
          <li key="input">
            <input {...register("screen", { valueAsNumber: true })} /></li>
        </ul>
      </fieldset>
      <button name="submit" type="submit">SUBMIT</button>
    </form>
  </div>;
};

export default ScreenshotInput;
