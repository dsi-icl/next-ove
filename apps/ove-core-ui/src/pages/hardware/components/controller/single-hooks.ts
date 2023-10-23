import { useEffect } from "react";
import { isError } from "@ove/ove-types";
import { trpc } from "../../../../utils/api";
import { useStore } from "../../../../store";

export const useStatus = (deviceId: string, bridgeId: string, setStatus: (deviceId: string, status: "running" | "off" | null) => void) => {
  const status = trpc.hardware.getStatus.useQuery({
    bridgeId,
    deviceId
  }, { enabled: false });

  useEffect(() => {
    if (status.status !== "success") return;
    setStatus(deviceId, status.data.response && !isError(status.data.response) ? "running" : "off");
  }, [status.status, status.isRefetching]);

  return status.refetch;
};

export const useInfo = (deviceId: string, bridgeId: string) => {
  const setInfo = useStore(state => state.hardwareConfig.setInfo);
  const curInfo = useStore(state => state.hardwareConfig.info);
  const info = trpc.hardware.getInfo.useQuery({
    bridgeId,
    deviceId,
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

  return info.refetch;
};

export const useStartDevice = (deviceId: string, showNotification: (text: string) => void) => {
  const start = trpc.hardware.start.useMutation();

  useEffect(() => {
    if (start.status === "error" || (start.status === "success" && isError(start.data.response))) {
      showNotification(`Failed to start: ${deviceId}`);
    } else if (start.status === "success") {
      showNotification(`Started ${deviceId}`);
    }
  }, [start.status]);

  return start.mutateAsync;
};

export const useShutdownDevice = (deviceId: string, showNotification: (text: string) => void) => {
  const shutdown = trpc.hardware.shutdown.useMutation();

  useEffect(() => {
    if (shutdown.status === "error" || (shutdown.status === "success" && isError(shutdown.data.response))) {
      showNotification(`Failed to stop ${deviceId}`);
    } else if (shutdown.status === "success") {
      showNotification(`Stopped ${deviceId}`);
    }
  }, [shutdown.status]);

  return shutdown.mutateAsync;
};

export const useRebootDevice = (deviceId: string, showNotification: (text: string) => void) => {
  const restart = trpc.hardware.reboot.useMutation();

  useEffect(() => {
    if (restart.status === "error" || (restart.status === "success" && isError(restart.data.response))) {
      showNotification(`Failed to reboot ${deviceId}`);
    } else if (restart.status === "success") {
      showNotification(`Rebooted ${deviceId}`);
    }
  }, [restart.status]);

  return restart.mutateAsync;
};

export const useExecuteCommand = (deviceId: string, showNotification: (text: string) => void) => {
  const execute = trpc.hardware.execute.useMutation({ retry: false });
  const addCommand = useStore(state => state.hardwareConfig.addCommandHistory);

  useEffect(() => {
    if (execute.status === "error") {
      showNotification(`Failed to execute command on ${deviceId}`);
    } else if (execute.status === "success") {
      if ("response" in execute.data.response) {
        addCommand(execute.data.response.response);
      } else {
        addCommand(execute.data.response.oveError);
      }
    }
  }, [execute.status]);

  return execute.mutateAsync;
};

export const useScreenshot = (deviceId: string, showNotification: (text: string) => void) => {
  const takeScreenshot = trpc.hardware.screenshot.useMutation({ retry: false });
  const setScreenshots = useStore(state => state.hardwareConfig.setScreenshots);

  useEffect(() => {
    if (takeScreenshot.status === "error") {
      showNotification(`Failed to take screenshot on ${deviceId}`);
      return;
    } else if (takeScreenshot.status === "success") {
      if ("oveError" in takeScreenshot.data.response) {
        showNotification(`Failed to take screenshot on ${deviceId}`);
        return;
      }

      if (takeScreenshot.data.response.length === 0) {
        showNotification(`Screenshot(s) taken successfully on ${deviceId}`);
        return;
      }

      setScreenshots(takeScreenshot.data.response);
    }
  }, [takeScreenshot.status]);

  return takeScreenshot.mutateAsync;
};

export const useGetBrowserStatus = (bridgeId: string, deviceId: string, showNotification: (text: string) => void) => {
  const browserId = useStore(state => state.hardwareConfig.browserId);
  const getBrowserStatus = trpc.hardware.getBrowserStatus.useQuery({
    bridgeId,
    deviceId,
    browserId: browserId ?? -1
  }, { enabled: false });
  const setBrowserStatus = useStore(state => state.hardwareConfig.setBrowserStatus);

  useEffect(() => {
    if (getBrowserStatus.status === "error") {
      showNotification(`Failed to get browser status on ${deviceId}`);
    } else if (getBrowserStatus.status === "success") {
      if (typeof getBrowserStatus.data.response !== "boolean") {
        showNotification(`Failed to get browser status on ${deviceId}`);
        return;
      }

      setBrowserStatus(getBrowserStatus.data.response ? "running" : "off");
    }
  }, [getBrowserStatus.status, getBrowserStatus.isRefetching]);

  return getBrowserStatus.refetch;
};

export const useOpenBrowser = (deviceId: string, showNotification: (text: string) => void) => {
  const openBrowser = trpc.hardware.openBrowser.useMutation();

  useEffect(() => {
    if (openBrowser.status === "error") {
      showNotification(`Failed to open browser on ${deviceId}`);
    } else if (openBrowser.status === "success") {
      if (typeof openBrowser.data.response !== "number") {
        showNotification(`Failed to open browser on ${deviceId}`);
        return;
      }
      showNotification(`Opened browser on ${deviceId} with ID: ${openBrowser.data.response}`);
    }
  }, [openBrowser.status]);

  return openBrowser.mutateAsync;
};

export const useCloseBrowser = (deviceId: string, showNotification: (text: string) => void) => {
  const closeBrowser = trpc.hardware.closeBrowser.useMutation();

  useEffect(() => {
    if (closeBrowser.status === "error") {
      showNotification(`Failed to close browser on ${deviceId}`);
    } else if (closeBrowser.status === "success") {
      if (typeof closeBrowser.data.response !== "boolean" || !closeBrowser.data.response) {
        showNotification(`Failed to close browser on ${deviceId}`);
      } else {
        showNotification(`Successfully closed browser on ${deviceId}`);
      }
    }
  }, [closeBrowser.status]);

  return closeBrowser.mutateAsync;
};

export const useCloseBrowsers = (deviceId: string, showNotification: (text: string) => void) => {
  const closeBrowsers = trpc.hardware.closeBrowsers.useMutation();

  useEffect(() => {
    if (closeBrowsers.status === "error" || (closeBrowsers.status === "success" && isError(closeBrowsers.data.response))) {
      showNotification(`Failed to close browsers on ${deviceId}`);
    } else if (closeBrowsers.status === "success") {
      showNotification(`Closed browsers on ${deviceId}`);
    }
  }, [closeBrowsers.status]);

  return closeBrowsers.mutateAsync;
};

export const useSingleController = (deviceId: string, bridgeId: string, showNotification: (text: string) => void, setStatus: (deviceId: string, status: "running" | "off" | null) => void) => {
  const status = useStatus(deviceId, bridgeId, setStatus);
  const info = useInfo(deviceId, bridgeId);
  const start = useStartDevice(deviceId, showNotification);
  const shutdown = useShutdownDevice(deviceId, showNotification);
  const reboot = useRebootDevice(deviceId, showNotification);
  const execute = useExecuteCommand(deviceId, showNotification);
  const screenshot = useScreenshot(deviceId, showNotification);
  const getBrowserStatus = useGetBrowserStatus(bridgeId, deviceId, showNotification);
  const openBrowser = useOpenBrowser(deviceId, showNotification);
  const closeBrowser = useCloseBrowser(deviceId, showNotification);
  const closeBrowsers = useCloseBrowsers(deviceId, showNotification);

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
