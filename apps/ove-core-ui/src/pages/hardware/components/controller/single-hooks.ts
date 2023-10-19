import { useEffect } from "react";
import { trpc } from "../../../../utils/api";
import { useStore } from "../../../../store";
import { isError, type TCoreAPIOutput } from "@ove/ove-types";

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
    const data = info.data.response as TCoreAPIOutput<"getInfo">["response"];
    if (typeof data !== "object" || data === null || "oveError" in data) {
      setInfo(null);
    } else {
      setInfo({ data: data as object, type: curInfo?.type ?? "general" });
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
      const data = execute.data.response as TCoreAPIOutput<"execute">["response"];
      if ("response" in data) {
        addCommand(data.response);
      } else {
        addCommand(data.oveError);
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
      const data = takeScreenshot.data.response as TCoreAPIOutput<"screenshot">["response"];

      if ("oveError" in data) {
        showNotification(`Failed to take screenshot on ${deviceId}`);
        return;
      }

      if (data.length === 0) {
        showNotification(`Screenshot(s) taken successfully on ${deviceId}`);
        return;
      }

      setScreenshots(data);
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
      const data = getBrowserStatus.data.response as TCoreAPIOutput<"getBrowserStatus">["response"];
      if (typeof data !== "boolean") {
        showNotification(`Failed to get browser status on ${deviceId}`);
        return;
      }

      setBrowserStatus(data ? "running" : "off");
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
      const data = openBrowser.data.response as TCoreAPIOutput<"openBrowser">["response"];

      if (typeof data !== "number") {
        showNotification(`Failed to open browser on ${deviceId}`);
        return;
      }
      showNotification(`Opened browser on ${deviceId} with ID: ${data}`);
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
      const data = closeBrowser.data.response as TCoreAPIOutput<"closeBrowser">["response"];

      if (typeof data !== "boolean" || !data) {
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
