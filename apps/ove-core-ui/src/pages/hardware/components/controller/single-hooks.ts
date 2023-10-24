import { useEffect } from "react";
import { assert } from "@ove/ove-utils";
import { logger } from "../../../../env";
import { trpc } from "../../../../utils/api";
import { useStore } from "../../../../store";
import { type Browser, isError } from "@ove/ove-types";
import { type Action, type DeviceAction } from "../../types";

const isSkip = (type: Action, bridgeId: string, deviceAction: DeviceAction): boolean => deviceAction.bridgeId !== bridgeId || deviceAction.deviceId === null || deviceAction.action !== type || deviceAction.pending;

export const useStatus = (bridgeId: string, setStatus: (deviceId: string, status: "running" | "off" | null) => void) => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const status = trpc.hardware.getStatus.useQuery({
    bridgeId,
    deviceId: deviceAction.deviceId ?? ""
  }, { enabled: false });

  useEffect(() => {
    if (status.status !== "success") return;
    setStatus(assert(deviceAction.deviceId), status.data.response && !isError(status.data.response) ? "running" : "off");
  }, [status.status, status.isRefetching]);

  useEffect(() => {
    if (isSkip("status", bridgeId, deviceAction)) return;
    console.log("not skipping single");
    status.refetch().catch(logger.error);
  }, [deviceAction]);
};

export const useInfo = (bridgeId: string) => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const setInfo = useStore(state => state.hardwareConfig.setInfo);
  const curInfo = useStore(state => state.hardwareConfig.info);
  const info = trpc.hardware.getInfo.useQuery({
    bridgeId,
    deviceId: deviceAction.deviceId ?? "",
    type: curInfo?.type ?? "general"
  }, { enabled: false });

  useEffect(() => {
    if (info.status !== "success") return;
    if (typeof info.data.response !== "object" || info.data.response === null || "oveError" in info.data.response) {
      setInfo(null);
    } else {
      setInfo({ data: info.data.response, type: curInfo?.type ?? "general" });
    }
  }, [info.status, info.isRefetching]);

  useEffect(() => {
    if (isSkip("info", bridgeId, deviceAction)) return;
    info.refetch().catch(logger.error);
  }, [deviceAction, curInfo?.type]);
};

export const useStartDevice = (bridgeId: string, showNotification: (text: string) => void) => {
  const start = trpc.hardware.start.useMutation();
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);

  useEffect(() => {
    if (start.status === "error" || (start.status === "success" && isError(start.data.response))) {
      showNotification(`Failed to start: ${deviceAction.deviceId}`);
    } else if (start.status === "success") {
      showNotification(`Started ${deviceAction.deviceId}`);
    }
  }, [start.status]);

  useEffect(() => {
    if (isSkip("start", bridgeId, deviceAction)) return;
    start.mutateAsync({bridgeId, deviceId: assert(deviceAction.deviceId)}).catch(logger.error);
  }, [deviceAction]);
};

export const useShutdownDevice = (bridgeId: string, showNotification: (text: string) => void) => {
  const shutdown = trpc.hardware.shutdown.useMutation();
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);

  useEffect(() => {
    if (shutdown.status === "error" || (shutdown.status === "success" && isError(shutdown.data.response))) {
      showNotification(`Failed to stop ${deviceAction.deviceId}`);
    } else if (shutdown.status === "success") {
      showNotification(`Stopped ${deviceAction.deviceId}`);
    }
  }, [shutdown.status]);

  useEffect(() => {
    if (isSkip("shutdown", bridgeId, deviceAction)) return;
    shutdown.mutateAsync({bridgeId, deviceId: assert(deviceAction.deviceId)}).catch(logger.error);
  }, [deviceAction]);
};

export const useRebootDevice = (bridgeId: string, showNotification: (text: string) => void) => {
  const reboot = trpc.hardware.reboot.useMutation();
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);

  useEffect(() => {
    if (reboot.status === "error" || (reboot.status === "success" && isError(reboot.data.response))) {
      showNotification(`Failed to reboot ${deviceAction.deviceId}`);
    } else if (reboot.status === "success") {
      showNotification(`Rebooted ${deviceAction.deviceId}`);
    }
  }, [reboot.status]);

  useEffect(() => {
    if (isSkip("reboot", bridgeId, deviceAction)) return;
    reboot.mutateAsync({bridgeId, deviceId: assert(deviceAction.deviceId)}).catch(logger.error);
  }, [deviceAction]);
};

export const useExecuteCommand = (bridgeId: string, showNotification: (text: string) => void) => {
  const execute = trpc.hardware.execute.useMutation({ retry: false });
  const addCommand = useStore(state => state.hardwareConfig.addCommandHistory);
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const command = useStore(state => state.hardwareConfig.command);

  useEffect(() => {
    if (execute.status === "error") {
      showNotification(`Failed to execute command on ${deviceAction.deviceId}`);
    } else if (execute.status === "success") {
      if ("response" in execute.data.response) {
        addCommand(execute.data.response.response);
      } else {
        addCommand(execute.data.response.oveError);
      }
    }
  }, [execute.status]);

  useEffect(() => {
    if (isSkip("execute", bridgeId, deviceAction) || command === null) return;
    execute.mutateAsync({bridgeId, deviceId: assert(deviceAction.deviceId), command}).catch(logger.error);
  }, [deviceAction, command]);
};

export const useScreenshot = (bridgeId: string, showNotification: (text: string) => void) => {
  const takeScreenshot = trpc.hardware.screenshot.useMutation({ retry: false });
  const setScreenshots = useStore(state => state.hardwareConfig.setScreenshots);
  const screenshotConfig = useStore(state => state.hardwareConfig.screenshotConfig);
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);

  useEffect(() => {
    if (takeScreenshot.status === "error") {
      showNotification(`Failed to take screenshot on ${deviceAction.deviceId}`);
    } else if (takeScreenshot.status === "success") {
      if ("oveError" in takeScreenshot.data.response) {
        showNotification(`Failed to take screenshot on ${deviceAction.deviceId}`);
        return;
      }

      if (takeScreenshot.data.response.length === 0) {
        showNotification(`Screenshot(s) taken successfully on ${deviceAction.deviceId}`);
        return;
      }

      setScreenshots(takeScreenshot.data.response);
    }
  }, [takeScreenshot.status]);

  useEffect(() => {
    if (isSkip("screenshot", bridgeId, deviceAction) || screenshotConfig === null) return;
    takeScreenshot.mutateAsync({bridgeId, deviceId: assert(deviceAction.deviceId), ...screenshotConfig});
  }, [screenshotConfig, deviceAction]);
};

export const useGetBrowser = (bridgeId: string, showNotification: (text: string) => void) => {
  const setBrowsers = useStore(state => state.hardwareConfig.setBrowsers);
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const browserId = useStore(state => state.hardwareConfig.browserId);
  const getBrowser = trpc.hardware.getBrowser.useQuery({
    bridgeId,
    deviceId: deviceAction.deviceId ?? "",
    browserId: browserId ?? -1
  }, { enabled: false });

  useEffect(() => {
    if (getBrowser.status === "error") {
      showNotification(`Failed to get browser on ${deviceAction.deviceId}`);
    } else if (getBrowser.status === "success") {
      if ("oveError" in getBrowser.data.response) {
        showNotification(`Failed to get browser on ${deviceAction.deviceId}`);
      } else {
        setBrowsers(new Map([[assert(browserId), getBrowser.data.response]]));
      }
    }
  }, [getBrowser.status, getBrowser.isRefetching]);

  useEffect(() => {
    if (isSkip("browser", bridgeId, deviceAction)) return;
    getBrowser.refetch().catch(logger.error);
  }, [deviceAction, browserId]);
};

export const useGetBrowsers = (bridgeId: string, showNotification: (text: string) => void) => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const getBrowsers = trpc.hardware.getBrowsers.useQuery({
    bridgeId,
    deviceId: deviceAction.deviceId ?? ""
  }, { enabled: false });
  const setBrowsers = useStore(state => state.hardwareConfig.setBrowsers);

  useEffect(() => {
    if (getBrowsers.status === "error") {
      showNotification(`Failed to get browsers on ${deviceAction.deviceId}`);
    } else if (getBrowsers.status === "success") {
      if ("oveError" in getBrowsers.data.response) {
        showNotification(`Failed to get browsers on ${deviceAction.deviceId}`);
        return;
      }

      setBrowsers(getBrowsers.data.response as Map<number, Browser>);
    }
  }, [getBrowsers.status, getBrowsers.isRefetching]);

  useEffect(() => {
    if (isSkip("browsers", bridgeId, deviceAction)) return;
    getBrowsers.refetch().catch(logger.error);
  }, [deviceAction]);
};

export const useOpenBrowser = (bridgeId: string, showNotification: (text: string) => void) => {
  const openBrowser = trpc.hardware.openBrowser.useMutation();
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const browserConfig = useStore(state => state.hardwareConfig.browserConfig);

  useEffect(() => {
    if (openBrowser.status === "error") {
      showNotification(`Failed to open browser on ${deviceAction.deviceId}`);
    } else if (openBrowser.status === "success") {
      if (typeof openBrowser.data.response !== "number") {
        showNotification(`Failed to open browser on ${deviceAction.deviceId}`);
        return;
      }
      showNotification(`Opened browser on ${deviceAction.deviceId} with ID: ${openBrowser.data.response}`);
    }
  }, [openBrowser.status]);

  useEffect(() => {
    if (isSkip("browser_open", bridgeId, deviceAction)) return;
    openBrowser.mutateAsync({bridgeId, deviceId: assert(deviceAction.deviceId), ...browserConfig}).catch(logger.error);
  }, [deviceAction]);
};

export const useCloseBrowser = (bridgeId: string, showNotification: (text: string) => void) => {
  const closeBrowser = trpc.hardware.closeBrowser.useMutation();
  const browserId = useStore(state => state.hardwareConfig.browserId);
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);

  useEffect(() => {
    if (closeBrowser.status === "error") {
      showNotification(`Failed to close browser on ${deviceAction.deviceId}`);
    } else if (closeBrowser.status === "success") {
      if (typeof closeBrowser.data.response !== "boolean" || !closeBrowser.data.response) {
        showNotification(`Failed to close browser on ${deviceAction.deviceId}`);
      } else {
        showNotification(`Successfully closed browser on ${deviceAction.deviceId}`);
      }
    }
  }, [closeBrowser.status]);

  useEffect(() => {
    if (isSkip("browser_close", bridgeId, deviceAction) || browserId === null) return;
    closeBrowser.mutateAsync({bridgeId, deviceId: assert(deviceAction.deviceId), browserId}).catch(logger.error);
  }, [deviceAction, browserId]);
};

export const useCloseBrowsers = (bridgeId: string, showNotification: (text: string) => void) => {
  const closeBrowsers = trpc.hardware.closeBrowsers.useMutation();
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);

  useEffect(() => {
    if (closeBrowsers.status === "error" || (closeBrowsers.status === "success" && isError(closeBrowsers.data.response))) {
      showNotification(`Failed to close browsers on ${deviceAction.deviceId}`);
    } else if (closeBrowsers.status === "success") {
      showNotification(`Closed browsers on ${deviceAction.deviceId}`);
    }
  }, [closeBrowsers.status]);

  useEffect(() => {
    if (isSkip("browsers_close", bridgeId, deviceAction)) return;
    closeBrowsers.mutateAsync({bridgeId, deviceId: assert(deviceAction.deviceId)}).catch(logger.error);
  }, []);
};

export const useSingleController = (bridgeId: string, showNotification: (text: string) => void, setStatus: (deviceId: string, status: "running" | "off" | null) => void) => {
  useStatus(bridgeId, setStatus);
  useInfo(bridgeId);
  useStartDevice(bridgeId, showNotification);
  useShutdownDevice(bridgeId, showNotification);
  useRebootDevice(bridgeId, showNotification);
  useExecuteCommand(bridgeId, showNotification);
  useScreenshot(bridgeId, showNotification);
  useGetBrowser(bridgeId, showNotification);
  useGetBrowsers(bridgeId, showNotification);
  useOpenBrowser(bridgeId, showNotification);
  useCloseBrowser(bridgeId, showNotification);
  useCloseBrowsers(bridgeId, showNotification);
};
