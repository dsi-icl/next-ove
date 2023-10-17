import { useEffect } from "react";
import { trpc } from "../../../../utils/api";
import { useStore } from "../../../../store";
import { type DeviceStatus } from "../../types";
import { isError, type TCoreAPIOutput } from "@ove/ove-types";

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
      const data = status.data.response as TCoreAPIOutput<"getStatusAll">["response"];
      if ("oveError" in data) {
        setAllStatus(tag, null);
        return;
      }
      setAllStatus(tag, data.map(({ deviceId, response }) => ({
        deviceId,
        status: isError(response) ? "off" : "running"
      })));
    }
  }, [status.status, status.isRefetching]);

  return status.refetch;
};

export const useInfo = (bridgeId: string, tag: string) => {
  const setInfo = useStore(state => state.setInfo);
  const curInfo = useStore(state => state.info);
  const info = trpc.hardware.getInfoAll.useQuery({bridgeId, tag: tag === "" ? undefined : tag, type: curInfo?.type ?? "general"});

  useEffect(() => {
    if (info.status !== "success") return;
    const data = info.data.response as TCoreAPIOutput<"getInfoAll">["response"];

    if ("oveError" in data) {
      setInfo(null);
      return;
    }

    setInfo({data: data.filter(({response}) => response !== null && typeof response === "object" && !("oveError" in response)), type: curInfo?.type ?? "general"});
  }, [info.status, info.isRefetching]);

  return info.refetch;
};

export const useStartDevice = (showNotification: (text: string) => void) => {
  const start = trpc.hardware.startAll.useMutation();

  useEffect(() => {
    if (start.status === "error") {
      showNotification("Failed to start devices");
    } else if (start.status === "success") {
      const data = start.data.response as TCoreAPIOutput<"startAll">["response"];
      if ("oveError" in data) {
        showNotification("Failed to start devices");
        return;
      }

      let containsError = false;

      data.forEach(({ deviceId, response }, i) => {
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
      const data = shutdown.data.response as TCoreAPIOutput<"shutdownAll">["response"];

      if ("oveError" in data) {
        showNotification("Failed to shutdown devices");
        return;
      }

      let containsError = false;

      data.forEach(({ deviceId, response }) => {
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
      const data = reboot.data.response as TCoreAPIOutput<"rebootAll">["response"];

      if ("oveError" in data) {
        showNotification("Failed to reboot devices");
        return;
      }

      let containsError = false;

      data.forEach(({ deviceId, response }, i) => {
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

export const useCloseBrowsers = (showNotification: (text: string) => void) => {
  const closeBrowsers = trpc.hardware.closeBrowsersAll.useMutation();

  useEffect(() => {
    if (closeBrowsers.status === "error") {
      showNotification("Failed to close browsers");
    } else if (closeBrowsers.status === "success") {
      const data = closeBrowsers.data.response as TCoreAPIOutput<"closeBrowsersAll">["response"];

      if ("oveError" in data) {
        showNotification("Failed to close browsers");
        return;
      }

      let containsErrors = false;

      data.forEach(({deviceId, response}, i) => {
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
  const closeBrowsers = useCloseBrowsers(showNotification);

  return { status, info, start, shutdown, reboot, closeBrowsers };
};
