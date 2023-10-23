import { useEffect } from "react";
import { isError } from "@ove/ove-types";
import { trpc } from "../../../../utils/api";
import { useStore } from "../../../../store";
import { type DeviceStatus } from "../../types";

export const useStatus = (bridgeId: string, tag: string, setAllStatus: (tag: string, status: DeviceStatus | {
  deviceId: string,
  status: DeviceStatus
}[]) => void) => {
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

  return status.refetch;
};

export const useInfo = (bridgeId: string, tag: string) => {
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

  return info.refetch;
};

export const useStartDevice = (showNotification: (text: string) => void) => {
  const start = trpc.hardware.startAll.useMutation();

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

  return start.mutateAsync;
};

export const useShutdownDevice = (showNotification: (text: string) => void) => {
  const shutdown = trpc.hardware.shutdownAll.useMutation();

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

  return shutdown.mutateAsync;
};

export const useRebootDevice = (showNotification: (text: string) => void) => {
  const reboot = trpc.hardware.rebootAll.useMutation();

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

  return reboot.mutateAsync;
};

export const useExecuteCommand = (showNotification: (text: string) => void) => {
  const execute = trpc.hardware.executeAll.useMutation({ retry: false });
  const addCommand = useStore(state => state.hardwareConfig.addCommandHistory);

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

  return execute.mutateAsync;
};

export const useScreenshot = (showNotification: (text: string) => void) => {
  const screenshot = trpc.hardware.screenshotAll.useMutation({ retry: false });
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

  return screenshot.mutateAsync;
};

export const useGetBrowserStatus = (bridgeId: string, tag: string, showNotification: (text: string) => void) => {
  const browserId = useStore(state => state.hardwareConfig.browserId);
  const setBrowserStatus = useStore(state => state.hardwareConfig.setBrowserStatus);
  const getBrowserStatus = trpc.hardware.getBrowserStatusAll.useQuery({
    bridgeId,
    tag: tag === "" ? undefined : tag,
    browserId: browserId ?? -1
  }, { enabled: false });

  useEffect(() => {
    if (getBrowserStatus.status === "error") {
      showNotification("Failed to get browser statuses");
    } else if (getBrowserStatus.status === "success") {
      if ("oveError" in getBrowserStatus.data.response) {
        showNotification("Failed to get browser statuses");
        return;
      }

      setBrowserStatus(getBrowserStatus.data.response.map(({ deviceId, response }) => ({
        deviceId,
        response: typeof response !== "boolean" || !response ? "off" : "running"
      })));
    }
  }, [getBrowserStatus.status, getBrowserStatus.isRefetching]);

  return getBrowserStatus.refetch;
};

export const useOpenBrowser = (showNotification: (text: string) => void) => {
  const openBrowser = trpc.hardware.openBrowserAll.useMutation();

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

  return openBrowser.mutateAsync;
};

export const useCloseBrowser = (showNotification: (text: string) => void) => {
  const closeBrowser = trpc.hardware.closeBrowserAll.useMutation();

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

  return closeBrowser.mutateAsync;
};

export const useCloseBrowsers = (showNotification: (text: string) => void) => {
  const closeBrowsers = trpc.hardware.closeBrowsersAll.useMutation();

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

  return closeBrowsers.mutateAsync;
};

export const useMultiController = (bridgeId: string, tag: string, showNotification: (text: string) => void, setStatus: (tag: string, status: DeviceStatus | {
  deviceId: string,
  status: DeviceStatus
}[]) => void) => {
  const status = useStatus(bridgeId, tag, setStatus);
  const info = useInfo(bridgeId, tag);
  const start = useStartDevice(showNotification);
  const shutdown = useShutdownDevice(showNotification);
  const reboot = useRebootDevice(showNotification);
  const execute = useExecuteCommand(showNotification);
  const screenshot = useScreenshot(showNotification);
  const getBrowserStatus = useGetBrowserStatus(bridgeId, tag, showNotification);
  const openBrowser = useOpenBrowser(showNotification);
  const closeBrowser = useCloseBrowser(showNotification);
  const closeBrowsers = useCloseBrowsers(showNotification);

  return {
    status,
    info,
    start,
    shutdown,
    reboot,
    execute,
    screenshot,
    getBrowserStatus,
    openBrowser,
    closeBrowser,
    closeBrowsers
  };
};
