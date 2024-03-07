import { useEffect } from "react";
import { assert } from "@ove/ove-utils";
import { logger } from "../../../../env";
import { trpc } from "../../../../utils/api";
import { useStore } from "../../../../store";
import { type Browser } from "@ove/ove-types";
import { type Action, type DeviceAction } from "../../types";

const isSkip = (
  type: Action,
  bridgeId: string,
  deviceAction: DeviceAction
): boolean => deviceAction.bridgeId !== bridgeId ||
  deviceAction.deviceId !== null || deviceAction.action !== type ||
  deviceAction.pending;

const useStartDevice = (
  bridgeId: string,
  tag: string,
  showNotification: (text: string) => void
) => {
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
          setTimeout(() => showNotification(
            `Failed to start: ${deviceId}`), 3000 * i);
          containsError = true;
        }
      });

      if (!containsError) {
        showNotification("Started devices");
      }
    }
  }, [start, showNotification]);

  useEffect(() => {
    if (isSkip("start", bridgeId, deviceAction)) return;
    start.mutateAsync({ bridgeId, tag: tag === "" ? undefined : tag });
  }, [bridgeId, start, tag, deviceAction]);
};

const useShutdownDevice = (
  bridgeId: string,
  tag: string,
  showNotification: (text: string) => void
) => {
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
        showNotification("Devices shutdown");
      }
    }
  }, [shutdown, showNotification]);

  useEffect(() => {
    if (isSkip("shutdown", bridgeId, deviceAction)) return;
    shutdown.mutateAsync({ bridgeId, tag: tag === "" ? undefined : tag });
  }, [bridgeId, shutdown, tag, deviceAction]);
};

const useRebootDevice = (
  bridgeId: string,
  tag: string,
  showNotification: (text: string) => void
) => {
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
          setTimeout(() => showNotification(
            `Failed to reboot: ${deviceId}`), 3000 * i);
          containsError = true;
        }
      });

      if (!containsError) {
        showNotification("Rebooted devices");
      }
    }
  }, [reboot, showNotification]);

  useEffect(() => {
    if (isSkip("reboot", bridgeId, deviceAction)) return;
    reboot.mutateAsync({ bridgeId, tag: tag === "" ? undefined : tag });
  }, [bridgeId, reboot, tag, deviceAction]);
};

const useExecuteCommand = (
  bridgeId: string,
  tag: string,
  showNotification: (text: string) => void
) => {
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
  }, [execute, addCommand, showNotification]);

  useEffect(() => {
    if (isSkip("execute", bridgeId, deviceAction) || command === null) return;
    execute.mutateAsync({
      bridgeId,
      tag: tag === "" ? undefined : tag,
      command
    });
  }, [bridgeId, execute, tag, deviceAction, command]);
};

const useScreenshot = (
  bridgeId: string,
  tag: string,
  showNotification: (text: string) => void
) => {
  const screenshot = trpc.hardware.screenshotAll.useMutation({ retry: false });
  const screenshotConfig = useStore(state =>
    state.hardwareConfig.screenshotConfig);
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

      screenshot.data.response.filter(({ response }) =>
        "oveError" in response).forEach(({ response }, i) =>
        setTimeout(() => showNotification((response as {
          oveError: string
        }).oveError), 3000 * i));

      setScreenshots(screenshot.data.response
        .filter(({ response }) => !("oveError" in response)) as {
        response: string[],
        deviceId: string
      }[]);
    }
  }, [screenshot, setScreenshots, showNotification]);

  useEffect(() => {
    if (isSkip("screenshot", bridgeId, deviceAction) ||
      screenshotConfig === null) return;
    screenshot.mutateAsync({
      bridgeId,
      tag: tag === "" ? undefined : tag, ...screenshotConfig
    });
  }, [bridgeId, screenshot, tag, deviceAction, screenshotConfig]);
};

const useGetBrowser = (
  bridgeId: string,
  tag: string,
  showNotification: (text: string) => void
) => {
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

      getBrowser.data.response.filter(({ response }) =>
        "oveError" in response).forEach(({ deviceId }, i) => {
        setTimeout(() => showNotification(
          `Failed to get browser on ${deviceId}`), 3000 * i);
      });
      setBrowsers(getBrowser.data.response
        .filter(({ response }) => !("oveError" in response)).map(({
          deviceId,
          response
        }) => ({
          deviceId,
          response: new Map([[assert(browserId), response as Browser]])
        })));
    }
  }, [getBrowser, browserId, setBrowsers, showNotification]);

  useEffect(() => {
    if (isSkip("browser", bridgeId, deviceAction) || browserId === null) return;
    getBrowser.refetch().catch(logger.error);
  }, [bridgeId, getBrowser, deviceAction, browserId]);
};

const useGetBrowsers = (
  bridgeId: string,
  tag: string,
  showNotification: (text: string) => void
) => {
  const browserId = useStore(state => state.hardwareConfig.browserId);
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

      getBrowsers.data.response.filter(({ response }) =>
        "oveError" in response).forEach(({ deviceId }, i) => {
        setTimeout(() => showNotification(
          `Failed to get browsers on ${deviceId}`), 3000 * i);
      });
      setBrowsers(getBrowsers.data.response
        .filter(({ response }) => !("oveError" in response)) as {
        deviceId: string,
        response: Map<number, Browser>
      }[]);
    }
  }, [getBrowsers, setBrowsers, showNotification]);

  useEffect(() => {
    if (isSkip("browser", bridgeId, deviceAction) || browserId !== null) return;
    getBrowsers.refetch().catch(logger.error);
  }, [bridgeId, getBrowsers, deviceAction, browserId]);
};

const useOpenBrowser = (
  bridgeId: string,
  tag: string,
  showNotification: (text: string) => void
) => {
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
          setTimeout(() => showNotification(
            `Failed to open browser on ${deviceId}`), 3000 * i);
        } else {
          setTimeout(() => showNotification(
            `Successfully opened browser on ${deviceId} with ID: 
            ${response}`), 3000 * i);
        }
      });
    }
  }, [openBrowser, showNotification]);

  useEffect(() => {
    if (isSkip("browser_open", bridgeId, deviceAction) ||
      browserConfig === null) return;
    openBrowser.mutateAsync({
      bridgeId,
      tag: tag === "" ? undefined : tag, ...browserConfig
    });
  }, [bridgeId, openBrowser, tag, deviceAction, browserConfig]);
};

const useCloseBrowser = (
  bridgeId: string,
  tag: string,
  showNotification: (text: string) => void
) => {
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
          setTimeout(() => showNotification(
            `Failed to close browser on ${deviceId}`), 3000 * i);
        } else {
          setTimeout(() => showNotification(
            `Successfully opened browser on ${deviceId}`), 3000 * i);
        }
      });
    }
  }, [closeBrowser, showNotification]);

  useEffect(() => {
    if (isSkip("browser_close", bridgeId, deviceAction) ||
      browserId === null) return;
    closeBrowser.mutateAsync({
      bridgeId,
      tag: tag === "" ? undefined : tag,
      browserId
    });
  }, [bridgeId, closeBrowser, tag, deviceAction, browserId]);
};

const useCloseBrowsers = (
  bridgeId: string,
  tag: string,
  showNotification: (text: string) => void
) => {
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
          setTimeout(() => showNotification(
            `Failed to close browsers on: ${deviceId}`), 3000 * i);
          containsErrors = true;
        }
      });

      if (!containsErrors) {
        showNotification("Closed browsers");
      }
    }
  }, [closeBrowsers, showNotification]);

  useEffect(() => {
    if (isSkip("browsers_close", bridgeId, deviceAction)) return;
    closeBrowsers.mutateAsync({ bridgeId, tag: tag === "" ? undefined : tag });
  }, [bridgeId, closeBrowsers, tag, deviceAction]);
};

const useSetVolume = (
  bridgeId: string,
  tag: string,
  showNotification: (text: string) => void
) => {
  const volume = useStore(state => state.hardwareConfig.volume);
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const setVolume = trpc.hardware.setVolumeAll.useMutation();

  useEffect(() => {
    if (setVolume.status === "error") {
      showNotification("Failed to set volume");
    } else if (setVolume.status === "success") {
      if ("oveError" in setVolume.data.response) {
        showNotification("Failed to set volume");
        return;
      }

      let containsError = false;

      setVolume.data.response.forEach(({ deviceId, response }, i) => {
        if (typeof response !== "boolean" || !response) {
          setTimeout(() => showNotification(
            `Failed to set volume on ${deviceId}`), 3000 * i);
          containsError = true;
        }
      });

      if (!containsError) {
        showNotification("Successfully set volume");
      }
    }
  }, [setVolume, showNotification]);

  useEffect(() => {
    if (isSkip("volume", bridgeId, deviceAction) || volume === null) return;
    setVolume.mutateAsync({
      bridgeId,
      tag: tag === "" ? undefined : tag,
      volume
    }).catch(logger.error);
  }, [bridgeId, setVolume, tag, deviceAction, volume]);
};

const useMute = (
  bridgeId: string,
  tag: string,
  showNotification: (text: string) => void
) => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const mute = trpc.hardware.muteAll.useMutation();

  useEffect(() => {
    if (mute.status === "error") {
      showNotification("Failed to mute devices");
    } else if (mute.status === "success") {
      if ("oveError" in mute.data.response) {
        showNotification("Failed to mute devices");
        return;
      }

      let containsError = false;

      mute.data.response.forEach(({ deviceId, response }, i) => {
        if (typeof response !== "boolean" || !response) {
          setTimeout(() => showNotification(
            `Failed to mute ${deviceId}`), 3000 * i);
          containsError = true;
        }
      });

      if (!containsError) {
        showNotification("Muted devices");
      }
    }
  }, [mute, showNotification]);

  useEffect(() => {
    if (isSkip("mute", bridgeId, deviceAction)) return;
    mute.mutateAsync({
      bridgeId,
      tag: tag === "" ? undefined : tag
    }).catch(logger.error);
  }, [bridgeId, mute, tag, deviceAction]);
};

const useUnmute = (
  bridgeId: string,
  tag: string,
  showNotification: (text: string) => void
) => {
  const unmute = trpc.hardware.unmuteAll.useMutation();
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);

  useEffect(() => {
    if (unmute.status === "error") {
      showNotification("Failed to unmute devices");
    } else if (unmute.status === "success") {
      if ("oveError" in unmute.data.response) {
        showNotification("Failed to unmute devices");
        return;
      }

      let containsErrors = false;

      unmute.data.response.forEach(({ deviceId, response }, i) => {
        if (typeof response !== "boolean" || !response) {
          setTimeout(() => showNotification(
            `Failed to unmute ${deviceId}`), 3000 * i);
          containsErrors = true;
        }
      });

      if (!containsErrors) {
        showNotification("Successfully unmuted devices");
      }
    }
  }, [showNotification, unmute]);

  useEffect(() => {
    if (isSkip("unmute", bridgeId, deviceAction)) return;
    unmute.mutateAsync({
      bridgeId,
      tag: tag === "" ? undefined : tag
    }).catch(logger.error);
  }, [bridgeId, tag, unmute, deviceAction]);
};

const useMuteAudio = (
  bridgeId: string,
  tag: string,
  showNotification: (text: string) => void
) => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const muteAudio = trpc.hardware.muteAudioAll.useMutation();

  useEffect(() => {
    if (muteAudio.status === "error") {
      showNotification("Failed to mute audio on devices");
    } else if (muteAudio.status === "success") {
      if ("oveError" in muteAudio.data.response) {
        showNotification("Failed to mute audio on devices");
        return;
      }

      let containsError = false;

      muteAudio.data.response.forEach(({ deviceId, response }, i) => {
        if (typeof response !== "boolean" || !response) {
          setTimeout(() => showNotification(
            `Failed to mute audio on ${deviceId}`), 3000 * i);
          containsError = true;
        }
      });

      if (!containsError) {
        showNotification("Successfully muted audio on devices");
      }
    }
  }, [muteAudio, showNotification]);

  useEffect(() => {
    if (isSkip("audio_mute", bridgeId, deviceAction)) return;
    muteAudio.mutateAsync({
      bridgeId,
      tag: tag === "" ? undefined : tag
    }).catch(logger.error);
  }, [bridgeId, muteAudio, tag, deviceAction]);
};

const useUnmuteAudio = (
  bridgeId: string,
  tag: string,
  showNotification: (text: string) => void
) => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const unmuteAudio = trpc.hardware.unmuteAudioAll.useMutation();

  useEffect(() => {
    if (unmuteAudio.status === "error") {
      showNotification("Failed to unmute audio on devices");
    } else if (unmuteAudio.status === "success") {
      if ("oveError" in unmuteAudio.data.response) {
        showNotification("Failed to unmute audio on devices");
        return;
      }

      let containsError = false;

      unmuteAudio.data.response.forEach(({ deviceId, response }, i) => {
        if (typeof response !== "boolean" || !response) {
          setTimeout(() => showNotification(
            `Failed to unmute audio on ${deviceId}`), 3000 * i);
          containsError = true;
        }
      });

      if (!containsError) {
        showNotification("Successfully unmuted audio on devices");
      }
    }
  }, [unmuteAudio, showNotification]);

  useEffect(() => {
    if (isSkip("audio_unmute", bridgeId, deviceAction)) return;
    unmuteAudio.mutateAsync({
      bridgeId,
      tag: tag === "" ? undefined : tag
    }).catch(logger.error);
  }, [bridgeId, tag, unmuteAudio, deviceAction]);
};

const useMuteVideo = (
  bridgeId: string,
  tag: string,
  showNotification: (text: string) => void
) => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const muteVideo = trpc.hardware.muteVideoAll.useMutation();

  useEffect(() => {
    if (muteVideo.status === "error") {
      showNotification("Failed to mute video on devices");
    } else if (muteVideo.status === "success") {
      if ("oveError" in muteVideo.data.response) {
        showNotification("Failed to mute video on devices");
        return;
      }

      let containsError = false;

      muteVideo.data.response.forEach(({ deviceId, response }, i) => {
        if (typeof response !== "boolean" || !response) {
          setTimeout(() => showNotification(
            `Failed to mute video on ${deviceId}`), 3000 * i);
          containsError = true;
        }
      });

      if (!containsError) {
        showNotification("Successfully muted video on devices");
      }
    }
  }, [muteVideo, showNotification]);

  useEffect(() => {
    if (isSkip("video_mute", bridgeId, deviceAction)) return;
    muteVideo.mutateAsync({
      bridgeId,
      tag: tag === "" ? undefined : tag
    }).catch(logger.error);
  }, [bridgeId, muteVideo, tag, deviceAction]);
};

const useUnmuteVideo = (
  bridgeId: string,
  tag: string,
  showNotification: (text: string) => void
) => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const unmuteVideo = trpc.hardware.unmuteVideoAll.useMutation();

  useEffect(() => {
    if (unmuteVideo.status === "error") {
      showNotification("Failed to unmute video on devices");
    } else if (unmuteVideo.status === "success") {
      if ("oveError" in unmuteVideo.data.response) {
        showNotification("Failed to unmute video on devices");
        return;
      }

      let containsError = false;

      unmuteVideo.data.response.forEach(({ deviceId, response }, i) => {
        if (typeof response !== "boolean" || !response) {
          setTimeout(() => showNotification(
            `Failed to unmute video on ${deviceId}`), 3000 * i);
          containsError = true;
        }
      });

      if (!containsError) {
        showNotification("Successfully unmuted video on devices");
      }
    }
  }, [unmuteVideo, showNotification]);

  useEffect(() => {
    if (isSkip("video_unmute", bridgeId, deviceAction)) return;
    unmuteVideo.mutateAsync({
      bridgeId,
      tag: tag === "" ? undefined : tag
    }).catch(logger.error);
  }, [bridgeId, tag, unmuteVideo, deviceAction]);
};

export const useMultiController = (
  bridgeId: string,
  tag: string,
  showNotification: (text: string) => void
) => {
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
  useSetVolume(bridgeId, tag, showNotification);
  useMute(bridgeId, tag, showNotification);
  useUnmute(bridgeId, tag, showNotification);
  useMuteAudio(bridgeId, tag, showNotification);
  useUnmuteAudio(bridgeId, tag, showNotification);
  useMuteVideo(bridgeId, tag, showNotification);
  useUnmuteVideo(bridgeId, tag, showNotification);
};
