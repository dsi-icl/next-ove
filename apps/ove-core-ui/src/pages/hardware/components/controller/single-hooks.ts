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
  const setInfo = useStore(state => state.setInfo);
  const curInfo = useStore(state => state.info);
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
  const closeBrowsers = useCloseBrowsers(deviceId, showNotification);

  return { status, info, start, shutdown, reboot, closeBrowsers };
};
