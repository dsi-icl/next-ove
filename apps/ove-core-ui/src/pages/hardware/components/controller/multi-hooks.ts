import { useEffect } from "react";
import { Browser, isError } from "@ove/ove-types";
import { logger } from "../../../../env";
import { trpc } from "../../../../utils/api";
import { useStore } from "../../../../store";
import { type Action, type DeviceAction, type DeviceStatus } from "../../types";
import { assert } from "@ove/ove-utils";

const isSkip = (type: Action, bridgeId: string, deviceAction: DeviceAction): boolean => deviceAction.bridgeId !== bridgeId || deviceAction.deviceId !== null || deviceAction.action !== type || deviceAction.pending;

export const useStatus = (bridgeId: string, tag: string, setAllStatus: (tag: string, status: DeviceStatus | {
  deviceId: string,
  status: DeviceStatus
}[]) => void) => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const status = trpc.hardware.getStatusAll.useQuery({
    bridgeId,
    tag: tag === "" ? undefined : tag
  }, { enabled: false });

  useEffect(() => {
    if (status.status === "error") {
      setAllStatus(tag, null);
    } else if (status.status === "success") {
      if ("oveError" in status.data.response) {
        setAllStatus(tag, null);
        return;
      }
      setAllStatus(tag, status.data.response.map(({ deviceId, response }) => ({
        deviceId,
        status: isError(response) ? "off" : "running"
      })));
    }
  }, [status.status, status.isRefetching]);

  useEffect(() => {
    if (isSkip("status", bridgeId, deviceAction)) return;
    console.log("Not skipping multi");
    status.refetch().catch(logger.error);
  }, [deviceAction]);
};

export const useInfo = (bridgeId: string, tag: string) => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const setInfo = useStore(state => state.hardwareConfig.setInfo);
  const curInfo = useStore(state => state.hardwareConfig.info);
  const info = trpc.hardware.getInfoAll.useQuery({
    bridgeId,
    tag: tag === "" ? undefined : tag,
    type: curInfo?.type ?? "general"
  }, { enabled: false });

  useEffect(() => {
    if (info.status !== "success") return;
    if ("oveError" in info.data.response) {
      setInfo(null);
      return;
    }

    setInfo({
      data: info.data.response.filter(({ response }) => response !== null && typeof response === "object" && !("oveError" in response)),
      type: curInfo?.type ?? "general"
    });
  }, [info.status, info.isRefetching]);

  useEffect(() => {
    if (isSkip("info", bridgeId, deviceAction)) return;
    info.refetch().catch(logger.error);
  }, [deviceAction, curInfo?.type]);
};

export const useStartDevice = (bridgeId: string, tag: string, showNotification: (text: string) => void) => {
  const start = trpc.hardware.startAll.useMutation();
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);

  useEffect(() => {
    if (start.status === "error") {
      showNotification("Failed to start devices");
    } else if (start.status === "success") {
      if ("oveError" in start.data.response) {
        showNotification("Failed to start devices");
        return;
      }

      let containsError = false;

      start.data.response.forEach(({ deviceId, response }, i) => {
        if (typeof response === "object") {
          setTimeout(() => showNotification(`Failed to start: ${deviceId}`), 3000 * i);
          containsError = true;
        }
      });

      if (!containsError) {
        showNotification(`Started devices`);
      }
    }
  }, [start.status]);

  useEffect(() => {
    if (isSkip("start", bridgeId, deviceAction)) return;
    start.mutateAsync({ bridgeId, tag: tag === "" ? undefined : tag });
  }, [deviceAction]);
};

export const useShutdownDevice = (bridgeId: string, tag: string, showNotification: (text: string) => void) => {
  const shutdown = trpc.hardware.shutdownAll.useMutation();
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);

  useEffect(() => {
    if (shutdown.status === "error") {
      showNotification("Failed to shutdown devices");
    } else if (shutdown.status === "success") {
      if ("oveError" in shutdown.data.response) {
        showNotification("Failed to shutdown devices");
        return;
      }

      let containsError = false;

      shutdown.data.response.forEach(({ deviceId, response }) => {
        if (typeof response === "object") {
          showNotification(`Failed to shutdown ${deviceId}`);
          containsError = true;
        }
      });

      if (!containsError) {
        showNotification(`Devices shutdown`);
      }
    }
  }, [shutdown.status]);

  useEffect(() => {
    if (isSkip("shutdown", bridgeId, deviceAction)) return;
    shutdown.mutateAsync({ bridgeId, tag: tag === "" ? undefined : tag });
  }, [deviceAction]);
};

export const useRebootDevice = (bridgeId: string, tag: string, showNotification: (text: string) => void) => {
  const reboot = trpc.hardware.rebootAll.useMutation();
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);

  useEffect(() => {
    if (reboot.status === "error") {
      showNotification("Failed to reboot devices");
    } else if (reboot.status === "success") {
      if ("oveError" in reboot.data.response) {
        showNotification("Failed to reboot devices");
        return;
      }

      let containsError = false;

      reboot.data.response.forEach(({ deviceId, response }, i) => {
        if (typeof response === "object") {
          setTimeout(() => showNotification(`Failed to reboot: ${deviceId}`), 3000 * i);
          containsError = true;
        }
      });

      if (!containsError) {
        showNotification("Rebooted devices");
      }
    }
  }, [reboot.status]);

  useEffect(() => {
    if (isSkip("reboot", bridgeId, deviceAction)) return;
    reboot.mutateAsync({ bridgeId, tag: tag === "" ? undefined : tag });
  }, [deviceAction]);
};

export const useExecuteCommand = (bridgeId: string, tag: string, showNotification: (text: string) => void) => {
  const execute = trpc.hardware.executeAll.useMutation({ retry: false });
  const addCommand = useStore(state => state.hardwareConfig.addCommandHistory);
  const command = useStore(state => state.hardwareConfig.command);
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);

  useEffect(() => {
    if (execute.status === "error") {
      showNotification("Failed to execute command");
    } else if (execute.status === "success") {
      if ("oveError" in execute.data.response) {
        showNotification("Failed to execute command");
        return;
      }

      execute.data.response.forEach(({ deviceId, response }) => {
        if ("response" in response) {
          addCommand(`${deviceId} > ${response.response}`);
        } else {
          addCommand(`${deviceId} > ${response.oveError}`);
        }
      });
    }
  }, [execute.status]);

  useEffect(() => {
    if (isSkip("execute", bridgeId, deviceAction) || command === null) return;
    execute.mutateAsync({
      bridgeId,
      tag: tag === "" ? undefined : tag,
      command
    });
  }, [deviceAction, command]);
};

export const useScreenshot = (bridgeId: string, tag: string, showNotification: (text: string) => void) => {
  const screenshot = trpc.hardware.screenshotAll.useMutation({ retry: false });
  const screenshotConfig = useStore(state => state.hardwareConfig.screenshotConfig);
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const setScreenshots = useStore(state => state.hardwareConfig.setScreenshots);

  useEffect(() => {
    if (screenshot.status === "error") {
      showNotification("Failed to take screenshots");
    } else if (screenshot.status === "success") {
      if ("oveError" in screenshot.data.response) {
        showNotification("Failed to take screenshots");
        return;
      }

      screenshot.data.response.filter(({ response }) => "oveError" in response).forEach(({ response }, i) => setTimeout(() => showNotification((response as {
        oveError: string
      }).oveError), 3000 * i));

      setScreenshots(screenshot.data.response.filter(({ response }) => !("oveError" in response)) as {
        response: string[],
        deviceId: string
      }[]);
    }
  }, [screenshot.status]);

  useEffect(() => {
    if (isSkip("screenshot", bridgeId, deviceAction) || screenshotConfig === null) return;
    screenshot.mutateAsync({
      bridgeId,
      tag: tag === "" ? undefined : tag, ...screenshotConfig
    });
  }, [deviceAction, screenshotConfig]);
};

export const useGetBrowser = (bridgeId: string, tag: string, showNotification: (text: string) => void) => {
  const browserId = useStore(state => state.hardwareConfig.browserId);
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const setBrowsers = useStore(state => state.hardwareConfig.setBrowsers);

  const getBrowser = trpc.hardware.getBrowserAll.useQuery({
    bridgeId,
    tag: tag === "" ? undefined : tag,
    browserId: browserId ?? -1
  }, { enabled: false });

  useEffect(() => {
    if (getBrowser.status === "error") {
      showNotification("Failed to get browsers");
    } else if (getBrowser.status === "success") {
      if ("oveError" in getBrowser.data.response) {
        showNotification("Failed to get browsers");
        return;
      }

      getBrowser.data.response.filter(({ response }) => "oveError" in response).forEach(({ deviceId }, i) => {
        setTimeout(() => showNotification(`Failed to get browser on ${deviceId}`), 3000 * i);
      });
      setBrowsers(getBrowser.data.response.filter(({ response }) => !("oveError" in response)).map(({
        deviceId,
        response
      }) => ({
        deviceId,
        response: new Map([[assert(browserId), response as Browser]])
      })));
    }
  }, [getBrowser.status, getBrowser.isRefetching]);

  useEffect(() => {
    if (isSkip("browser", bridgeId, deviceAction) || browserId === null) return;
    getBrowser.refetch().catch(logger.error);
  }, [deviceAction, browserId]);
};

export const useGetBrowsers = (bridgeId: string, tag: string, showNotification: (text: string) => void) => {
  const setBrowsers = useStore(state => state.hardwareConfig.setBrowsers);
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);

  const getBrowsers = trpc.hardware.getBrowsersAll.useQuery({
    bridgeId,
    tag: tag === "" ? undefined : tag
  }, { enabled: false });

  useEffect(() => {
    if (getBrowsers.status === "error") {
      showNotification("Failed to get browsers");
    } else if (getBrowsers.status === "success") {
      if ("oveError" in getBrowsers.data.response) {
        showNotification("Failed to get browsers");
        return;
      }

      getBrowsers.data.response.filter(({ response }) => "oveError" in response).forEach(({ deviceId }, i) => {
        setTimeout(() => showNotification(`Failed to get browsers on ${deviceId}`), 3000 * i);
      });
      setBrowsers(getBrowsers.data.response.filter(({ response }) => !("oveError" in response)) as {
        deviceId: string,
        response: Map<number, Browser>
      }[]);
    }
  }, [getBrowsers.status, getBrowsers.isRefetching]);

  useEffect(() => {
    if (isSkip("browsers", bridgeId, deviceAction)) return;
    getBrowsers.refetch().catch(logger.error);
  }, [deviceAction]);
};

export const useOpenBrowser = (bridgeId: string, tag: string, showNotification: (text: string) => void) => {
  const openBrowser = trpc.hardware.openBrowserAll.useMutation();
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const browserConfig = useStore(state => state.hardwareConfig.browserConfig);

  useEffect(() => {
    if (openBrowser.status === "error") {
      showNotification("Failed to open browsers");
    } else if (openBrowser.status === "success") {
      if ("oveError" in openBrowser.data.response) {
        showNotification("Failed to open browsers");
        return;
      }

      openBrowser.data.response.forEach(({ deviceId, response }, i) => {
        if (typeof response !== "number") {
          setTimeout(() => showNotification(`Failed to open browser on ${deviceId}`), 3000 * i);
        } else {
          setTimeout(() => showNotification(`Successfully opened browser on ${deviceId} with ID: ${response}`), 3000 * i);
        }
      });
    }

  }, [openBrowser.status]);

  useEffect(() => {
    if (isSkip("browser_open", bridgeId, deviceAction) || browserConfig === null) return;
    openBrowser.mutateAsync({
      bridgeId,
      tag: tag === "" ? undefined : tag, ...browserConfig
    });
  }, [deviceAction, browserConfig]);
};

export const useCloseBrowser = (bridgeId: string, tag: string, showNotification: (text: string) => void) => {
  const closeBrowser = trpc.hardware.closeBrowserAll.useMutation();
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const browserId = useStore(state => state.hardwareConfig.browserId);

  useEffect(() => {
    if (closeBrowser.status === "error") {
      showNotification("Failed to close browsers");
    } else if (closeBrowser.status === "success") {
      if ("oveError" in closeBrowser.data.response) {
        showNotification("Failed to close browsers");
        return;
      }

      closeBrowser.data.response.forEach(({ deviceId, response }, i) => {
        if (typeof response !== "boolean" || !response) {
          setTimeout(() => showNotification(`Failed to close browser on ${deviceId}`), 3000 * i);
        } else {
          setTimeout(() => showNotification(`Successfully opened browser on ${deviceId}`), 3000 * i);
        }
      });
    }
  }, [closeBrowser.status]);

  useEffect(() => {
    if (isSkip("browser_close", bridgeId, deviceAction) || browserId === null) return;
    closeBrowser.mutateAsync({
      bridgeId,
      tag: tag === "" ? undefined : tag,
      browserId
    });
  }, [deviceAction, browserId]);
};

export const useCloseBrowsers = (bridgeId: string, tag: string, showNotification: (text: string) => void) => {
  const closeBrowsers = trpc.hardware.closeBrowsersAll.useMutation();
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);

  useEffect(() => {
    if (closeBrowsers.status === "error") {
      showNotification("Failed to close browsers");
    } else if (closeBrowsers.status === "success") {
      if ("oveError" in closeBrowsers.data.response) {
        showNotification("Failed to close browsers");
        return;
      }

      let containsErrors = false;

      closeBrowsers.data.response.forEach(({ deviceId, response }, i) => {
        if (typeof response === "object") {
          setTimeout(() => showNotification(`Failed to close browsers on: ${deviceId}`), 3000 * i);
          containsErrors = true;
        }
      });

      if (!containsErrors) {
        showNotification("Closed browsers");
      }
    }
  }, [closeBrowsers.status]);

  useEffect(() => {
    if (isSkip("browsers_close", bridgeId, deviceAction)) return;
    closeBrowsers.mutateAsync({ bridgeId, tag: tag === "" ? undefined : tag });
  }, [deviceAction]);
};

export const useMultiController = (bridgeId: string, tag: string, showNotification: (text: string) => void, setStatus: (tag: string, status: DeviceStatus | {
  deviceId: string,
  status: DeviceStatus
}[]) => void) => {
  useStatus(bridgeId, tag, setStatus);
  useInfo(bridgeId, tag);
  useStartDevice(bridgeId, tag, showNotification);
  useShutdownDevice(bridgeId, tag, showNotification);
  useRebootDevice(bridgeId, tag, showNotification);
  useExecuteCommand(bridgeId, tag, showNotification);
  useScreenshot(bridgeId, tag, showNotification);
  useGetBrowser(bridgeId, tag, showNotification);
  useGetBrowsers(bridgeId, tag, showNotification);
  useOpenBrowser(bridgeId, tag, showNotification);
  useCloseBrowser(bridgeId, tag, showNotification);
  useCloseBrowsers(bridgeId, tag, showNotification);
};
