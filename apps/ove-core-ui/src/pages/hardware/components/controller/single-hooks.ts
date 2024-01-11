import { useEffect } from "react";
import { assert } from "@ove/ove-utils";
import { logger } from "../../../../env";
import { trpc } from "../../../../utils/api";
import { useStore } from "../../../../store";
import { type Browser, isError } from "@ove/ove-types";
import { type Action, type DeviceAction } from "../../types";

const isSkip = (
  type: Action,
  bridgeId: string,
  deviceAction: DeviceAction
): boolean => deviceAction.bridgeId !== bridgeId ||
  deviceAction.deviceId === null || deviceAction.action !== type ||
  deviceAction.pending;

const useStatus = (
  bridgeId: string,
  setStatus: (deviceId: string, status: "running" | "off" | null) => void
) => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const status = trpc.hardware.getStatus.useQuery({
    bridgeId,
    deviceId: deviceAction.deviceId ?? ""
  }, { enabled: false });

  useEffect(() => {
    if (status.status !== "success") return;
    setStatus(assert(deviceAction.deviceId), status.data.response &&
    !isError(status.data.response) ? "running" : "off");
  }, [status, deviceAction, setStatus]);

  useEffect(() => {
    if (isSkip("status", bridgeId, deviceAction)) return;
    status.refetch().catch(logger.error);
  }, [bridgeId, status, deviceAction]);
};

const useInfo = (bridgeId: string) => {
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
    if (typeof info.data.response !== "object" ||
      info.data.response === null || "oveError" in info.data.response) {
      setInfo(null);
    } else {
      setInfo({ data: info.data.response, type: curInfo?.type ?? "general" });
    }
  }, [info, curInfo?.type, setInfo]);

  useEffect(() => {
    if (isSkip("info", bridgeId, deviceAction)) return;
    info.refetch().catch(logger.error);
  }, [bridgeId, info, deviceAction, curInfo?.type]);
};

const useStartDevice = (
  bridgeId: string,
  showNotification: (text: string) => void
) => {
  const start = trpc.hardware.start.useMutation();
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);

  useEffect(() => {
    if (start.status === "error" || (start.status === "success" &&
      isError(start.data.response))) {
      showNotification(`Failed to start: ${deviceAction.deviceId}`);
    } else if (start.status === "success") {
      showNotification(`Started ${deviceAction.deviceId}`);
    }
  }, [start, deviceAction, showNotification]);

  useEffect(() => {
    if (isSkip("start", bridgeId, deviceAction)) return;
    start.mutateAsync({
      bridgeId,
      deviceId: assert(deviceAction.deviceId)
    }).catch(logger.error);
  }, [bridgeId, start, deviceAction]);
};

const useShutdownDevice = (
  bridgeId: string,
  showNotification: (text: string) => void
) => {
  const shutdown = trpc.hardware.shutdown.useMutation();
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);

  useEffect(() => {
    if (shutdown.status === "error" || (shutdown.status === "success" &&
      isError(shutdown.data.response))) {
      showNotification(`Failed to stop ${deviceAction.deviceId}`);
    } else if (shutdown.status === "success") {
      showNotification(`Stopped ${deviceAction.deviceId}`);
    }
  }, [shutdown, deviceAction, showNotification]);

  useEffect(() => {
    if (isSkip("shutdown", bridgeId, deviceAction)) return;
    shutdown.mutateAsync({
      bridgeId,
      deviceId: assert(deviceAction.deviceId)
    }).catch(logger.error);
  }, [bridgeId, shutdown, deviceAction]);
};

const useRebootDevice = (
  bridgeId: string,
  showNotification: (text: string) => void
) => {
  const reboot = trpc.hardware.reboot.useMutation();
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);

  useEffect(() => {
    if (reboot.status === "error" || (reboot.status === "success" &&
      isError(reboot.data.response))) {
      showNotification(`Failed to reboot ${deviceAction.deviceId}`);
    } else if (reboot.status === "success") {
      showNotification(`Rebooted ${deviceAction.deviceId}`);
    }
  }, [reboot, deviceAction, showNotification]);

  useEffect(() => {
    if (isSkip("reboot", bridgeId, deviceAction)) return;
    reboot.mutateAsync({
      bridgeId,
      deviceId: assert(deviceAction.deviceId)
    }).catch(logger.error);
  }, [bridgeId, reboot, deviceAction]);
};

const useExecuteCommand = (
  bridgeId: string,
  showNotification: (text: string) => void
) => {
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
  }, [execute, addCommand, deviceAction, showNotification]);

  useEffect(() => {
    if (isSkip("execute", bridgeId, deviceAction) || command === null) return;
    execute.mutateAsync({
      bridgeId,
      deviceId: assert(deviceAction.deviceId),
      command
    }).catch(logger.error);
  }, [bridgeId, execute, deviceAction, command]);
};

const useScreenshot = (
  bridgeId: string,
  showNotification: (text: string) => void
) => {
  const takeScreenshot = trpc.hardware.screenshot.useMutation({ retry: false });
  const setScreenshots = useStore(state => state.hardwareConfig.setScreenshots);
  const screenshotConfig = useStore(state =>
    state.hardwareConfig.screenshotConfig);
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);

  useEffect(() => {
    if (takeScreenshot.status === "error") {
      showNotification(
        `Failed to take screenshot on ${deviceAction.deviceId}`);
    } else if (takeScreenshot.status === "success") {
      if ("oveError" in takeScreenshot.data.response) {
        showNotification(
          `Failed to take screenshot on ${deviceAction.deviceId}`);
        return;
      }

      if (takeScreenshot.data.response.length === 0) {
        showNotification(
          `Screenshot(s) taken successfully on ${deviceAction.deviceId}`);
        return;
      }

      setScreenshots(takeScreenshot.data.response);
    }
  }, [takeScreenshot, deviceAction, setScreenshots, showNotification]);

  useEffect(() => {
    if (isSkip("screenshot", bridgeId, deviceAction) ||
      screenshotConfig === null) return;
    takeScreenshot.mutateAsync({
      bridgeId,
      deviceId: assert(deviceAction.deviceId), ...screenshotConfig
    });
  }, [bridgeId, takeScreenshot, screenshotConfig, deviceAction]);
};

const useGetBrowser = (
  bridgeId: string,
  showNotification: (text: string) => void
) => {
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
  }, [getBrowser, browserId, deviceAction, setBrowsers, showNotification]);

  useEffect(() => {
    if (isSkip("browser", bridgeId, deviceAction) || browserId === null) return;
    getBrowser.refetch().catch(logger.error);
  }, [deviceAction, browserId, bridgeId, getBrowser]);
};

const useGetBrowsers = (
  bridgeId: string,
  showNotification: (text: string) => void
) => {
  const browserId = useStore(state => state.hardwareConfig.browserId);
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
  }, [getBrowsers, deviceAction, setBrowsers, showNotification]);

  useEffect(() => {
    if (isSkip("browser", bridgeId, deviceAction) || browserId !== null) return;
    getBrowsers.refetch().catch(logger.error);
  }, [deviceAction, browserId, bridgeId, getBrowsers]);
};

const useOpenBrowser = (
  bridgeId: string,
  showNotification: (text: string) => void
) => {
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
      showNotification(
        `Opened browser on ${deviceAction.deviceId} with ID: 
        ${openBrowser.data.response}`);
    }
  }, [openBrowser, deviceAction, showNotification]);

  useEffect(() => {
    if (isSkip("browser_open", bridgeId, deviceAction)) return;
    openBrowser.mutateAsync({
      bridgeId,
      deviceId: assert(deviceAction.deviceId), ...browserConfig
    }).catch(logger.error);
  }, [deviceAction, bridgeId, browserConfig, openBrowser]);
};

const useCloseBrowser = (
  bridgeId: string,
  showNotification: (text: string) => void
) => {
  const closeBrowser = trpc.hardware.closeBrowser.useMutation();
  const browserId = useStore(state => state.hardwareConfig.browserId);
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);

  useEffect(() => {
    if (closeBrowser.status === "error") {
      showNotification(`Failed to close browser on ${deviceAction.deviceId}`);
    } else if (closeBrowser.status === "success") {
      if (typeof closeBrowser.data.response !== "boolean" ||
        !closeBrowser.data.response) {
        showNotification(`Failed to close browser on ${deviceAction.deviceId}`);
      } else {
        showNotification(
          `Successfully closed browser on ${deviceAction.deviceId}`);
      }
    }
  }, [closeBrowser, deviceAction, showNotification]);

  useEffect(() => {
    if (isSkip("browser_close", bridgeId, deviceAction) ||
      browserId === null) return;
    closeBrowser.mutateAsync({
      bridgeId,
      deviceId: assert(deviceAction.deviceId),
      browserId
    }).catch(logger.error);
  }, [deviceAction, browserId, bridgeId, closeBrowser]);
};

const useCloseBrowsers = (
  bridgeId: string,
  showNotification: (text: string) => void
) => {
  const closeBrowsers = trpc.hardware.closeBrowsers.useMutation();
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);

  useEffect(() => {
    if (closeBrowsers.status === "error" ||
      (closeBrowsers.status === "success" &&
        isError(closeBrowsers.data.response))) {
      showNotification(`Failed to close browsers on ${deviceAction.deviceId}`);
    } else if (closeBrowsers.status === "success") {
      showNotification(`Closed browsers on ${deviceAction.deviceId}`);
    }
  }, [closeBrowsers, deviceAction, showNotification]);

  useEffect(() => {
    if (isSkip("browsers_close", bridgeId, deviceAction)) return;
    closeBrowsers.mutateAsync({
      bridgeId,
      deviceId: assert(deviceAction.deviceId)
    }).catch(logger.error);
  }, [bridgeId, closeBrowsers, deviceAction]);
};

const useSetVolume = (
  bridgeId: string,
  showNotification: (text: string) => void
) => {
  const setVolume = trpc.hardware.setVolume.useMutation();
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const volume = useStore(state => state.hardwareConfig.volume);

  useEffect(() => {
    if (setVolume.status === "error") {
      showNotification(`Failed to set volume on ${deviceAction.deviceId}`);
    } else if (setVolume.status === "success") {
      if (typeof setVolume.data.response !== "boolean" ||
        !setVolume.data.response) {
        showNotification(
          `Failed to set volume on ${deviceAction.deviceId}`);
      } else {
        showNotification(
          `Successfully set volume on ${deviceAction.deviceId}`);
      }
    }
  }, [setVolume, deviceAction, showNotification]);

  useEffect(() => {
    if (isSkip("volume", bridgeId, deviceAction) || volume === null) return;
    console.log(deviceAction);
    console.log(volume);
    setVolume.mutateAsync({
      bridgeId,
      deviceId: assert(deviceAction.deviceId),
      volume
    }).catch(logger.error);
  }, [deviceAction, volume, bridgeId, setVolume]);
};

const useMute = (
  bridgeId: string,
  showNotification: (text: string) => void
) => {
  const deviceAction = useStore(state =>
    state.hardwareConfig.deviceAction);
  const mute = trpc.hardware.mute.useMutation();

  useEffect(() => {
    if (mute.status === "error") {
      showNotification(`Failed to mute ${deviceAction.deviceId}`);
    } else if (mute.status === "success") {
      if (typeof mute.data.response !== "boolean" || !mute.data.response) {
        showNotification(`Failed to mute ${deviceAction.deviceId}`);
      } else {
        showNotification(`Successfully muted ${deviceAction.deviceId}`);
      }
    }
  }, [mute, deviceAction, showNotification]);

  useEffect(() => {
    if (isSkip("mute", bridgeId, deviceAction)) return;
    mute.mutateAsync({
      bridgeId,
      deviceId: assert(deviceAction.deviceId)
    }).catch(logger.error);
  }, [deviceAction, bridgeId, mute]);
};

const useUnmute = (
  bridgeId: string,
  showNotification: (text: string) => void
) => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const unmute = trpc.hardware.unmute.useMutation();

  useEffect(() => {
    if (unmute.status === "error") {
      showNotification(`Failed to unmute ${deviceAction.deviceId}`);
    } else if (unmute.status === "success") {
      if (typeof unmute.data.response !== "boolean" || !unmute.data.response) {
        showNotification(`Failed to unmute ${deviceAction.deviceId}`);
      } else {
        showNotification(`Successfully unmuted ${deviceAction.deviceId}`);
      }
    }
  }, [unmute, deviceAction, showNotification]);

  useEffect(() => {
    if (isSkip("unmute", bridgeId, deviceAction)) return;
    unmute.mutateAsync({
      bridgeId,
      deviceId: assert(deviceAction.deviceId)
    }).catch(logger.error);
  }, [deviceAction, bridgeId, unmute]);
};

const useMuteAudio = (
  bridgeId: string,
  showNotification: (text: string) => void
) => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const muteAudio = trpc.hardware.muteAudio.useMutation();

  useEffect(() => {
    if (muteAudio.status === "error") {
      showNotification(`Failed to mute audio on ${deviceAction.deviceId}`);
    } else if (muteAudio.status === "success") {
      if (typeof muteAudio.data.response !== "boolean" ||
        !muteAudio.data.response) {
        showNotification(`Failed to mute audio on ${deviceAction.deviceId}`);
      } else {
        showNotification(
          `Successfully muted audio on ${deviceAction.deviceId}`);
      }
    }
  }, [muteAudio, deviceAction, showNotification]);

  useEffect(() => {
    if (isSkip("audio_mute", bridgeId, deviceAction)) return;
    muteAudio.mutateAsync({
      bridgeId,
      deviceId: assert(deviceAction.deviceId)
    }).catch(logger.error);
  }, [deviceAction, bridgeId, muteAudio]);
};

const useUnmuteAudio = (
  bridgeId: string,
  showNotification: (text: string) => void
) => {
  const deviceAction = useStore(state =>
    state.hardwareConfig.deviceAction);
  const unmuteAudio = trpc.hardware.unmuteAudio.useMutation();

  useEffect(() => {
    if (unmuteAudio.status === "error") {
      showNotification(
        `Failed to unmute audio on ${deviceAction.deviceId}`);
    } else if (unmuteAudio.status === "success") {
      if (typeof unmuteAudio.data.response !== "boolean" ||
        !unmuteAudio.data.response) {
        showNotification(
          `Failed to unmute audio on ${deviceAction.deviceId}`);
      } else {
        showNotification(
          `Successfully unmuted audio on ${deviceAction.deviceId}`);
      }
    }
  }, [unmuteAudio, deviceAction, showNotification]);

  useEffect(() => {
    if (isSkip("audio_unmute", bridgeId, deviceAction)) return;
    unmuteAudio.mutateAsync({
      bridgeId,
      deviceId: assert(deviceAction.deviceId)
    }).catch(logger.error);
  }, [bridgeId, unmuteAudio, deviceAction]);
};

const useMuteVideo = (
  bridgeId: string,
  showNotification: (text: string) => void
) => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const muteVideo = trpc.hardware.muteVideo.useMutation();

  useEffect(() => {
    if (muteVideo.status === "error") {
      showNotification(`Failed to mute video on ${deviceAction.deviceId}`);
    } else if (muteVideo.status === "success") {
      if (typeof muteVideo.data.response !== "boolean" ||
        !muteVideo.data.response) {
        showNotification(`Failed to mute video on ${deviceAction.deviceId}`);
      } else {
        showNotification(
          `Successfully muted video on ${deviceAction.deviceId}`);
      }
    }
  }, [muteVideo, deviceAction, showNotification]);

  useEffect(() => {
    if (isSkip("video_mute", bridgeId, deviceAction)) return;
    muteVideo.mutateAsync({
      bridgeId,
      deviceId: assert(deviceAction.deviceId)
    }).catch(logger.error);
  }, [deviceAction, bridgeId, muteVideo]);
};

const useUnmuteVideo = (
  bridgeId: string,
  showNotification: (text: string) => void
) => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const unmuteVideo = trpc.hardware.unmuteVideo.useMutation();

  useEffect(() => {
    if (unmuteVideo.status === "error") {
      showNotification(`Failed to unmute video on ${deviceAction.deviceId}`);
    } else if (unmuteVideo.status === "success") {
      if (typeof unmuteVideo.data.response !== "boolean" ||
        !unmuteVideo.data.response) {
        showNotification(`Failed to unmute video on ${deviceAction.deviceId}`);
      } else {
        showNotification(
          `Successfully unmuted video on ${deviceAction.deviceId}`);
      }
    }
  }, [unmuteVideo, deviceAction.deviceId, showNotification]);

  useEffect(() => {
    if (isSkip("video_unmute", bridgeId, deviceAction)) return;
    unmuteVideo.mutateAsync({
      bridgeId,
      deviceId: assert(deviceAction.deviceId)
    }).catch(logger.error);
  }, [deviceAction, bridgeId, unmuteVideo]);
};

export const useSingleController = (
  bridgeId: string,
  showNotification: (text: string) => void,
  setStatus: (deviceId: string, status: "running" | "off" | null) => void
) => {
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
  useSetVolume(bridgeId, showNotification);
  useMute(bridgeId, showNotification);
  useUnmute(bridgeId, showNotification);
  useMuteAudio(bridgeId, showNotification);
  useUnmuteAudio(bridgeId, showNotification);
  useMuteVideo(bridgeId, showNotification);
  useUnmuteVideo(bridgeId, showNotification);
};
