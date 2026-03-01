import { toast } from "sonner";
import { api } from "../../../../utils/api";
import { getFailingDevices } from "../../utils";
import type { Source } from "@ove/ove-types";

const handleFailingDevices = (
  action: { error: string; success: string },
  data: Parameters<typeof getFailingDevices>[0],
) => {
  const failing = getFailingDevices(data);
  if (failing.length > 0) {
    return `Failed to ${action} ${failing.join(", ")}`;
  }
  return `${action} devices`;
};

export const useStart = (
  bridgeId: string,
  deviceId: string | null,
  tags?: string[],
  deviceIds?: string[],
) => {
  const start = api.hardware.start.useMutation();
  const startAll = api.hardware.startAll.useMutation();

  if (deviceId === null) {
    return {
      start: () =>
        toast.promise(startAll.mutateAsync({ bridgeId, tags, deviceIds }), {
          loading: "Starting devices...",
          error: `Failed to start devices`,
          success: (data) =>
            handleFailingDevices({ error: "start", success: "Started" }, data),
        }),
    };
  }
  return {
    start: () =>
      toast.promise(
        Promise.resolve(
          start.mutateAsync({
            bridgeId,
            deviceId,
          })
        ),
        {
          loading: `Starting ${deviceId}...`,
          error: `Failed to start ${deviceId}`,
          success: `Started ${deviceId}`,
        },
      ),
  };
};

export const useShutdown = (
  bridgeId: string,
  deviceId: string | null,
  tags?: string[],
  deviceIds?: string[],
) => {
  const shutdown = api.hardware.shutdown.useMutation();
  const shutdownAll = api.hardware.shutdownAll.useMutation();

  if (deviceId === null) {
    return {
      shutdown: () =>
        toast.promise(shutdownAll.mutateAsync({ bridgeId, tags, deviceIds }), {
          loading: "Shutting down devices...",
          error: "Failed to shut down devices",
          success: (data) =>
            handleFailingDevices(
              { error: "shut down", success: "Shut down" },
              data,
            ),
        }),
    };
  }
  return {
    shutdown: () =>
      toast.promise(
        shutdown.mutateAsync({
          bridgeId,
          deviceId,
        }),
        {
          loading: `Shutting down ${deviceId}`,
          error: `Failed to shut down ${deviceId}`,
          success: `Shut down ${deviceId}`,
        },
      ),
  };
};

export const useReboot = (
  bridgeId: string,
  deviceId: string | null,
  tags?: string[],
  deviceIds?: string[],
) => {
  const reboot = api.hardware.reboot.useMutation();
  const rebootAll = api.hardware.rebootAll.useMutation();

  if (deviceId === null) {
    return {
      reboot: () =>
        toast.promise(rebootAll.mutateAsync({ bridgeId, tags, deviceIds }), {
          loading: "Rebooting devices...",
          success: (data) =>
            handleFailingDevices(
              { error: "reboot", success: "Rebooted" },
              data,
            ),
          error: "Failed to reboot devices",
        }),
    };
  }
  return {
    reboot: () =>
      toast.promise(
        reboot.mutateAsync({
          bridgeId,
          deviceId,
        }),
        {
          loading: `Rebooting ${deviceId}...`,
          error: `Failed to reboot ${deviceId}`,
          success: `Rebooted ${deviceId}`,
        },
      ),
  };
};

export const useReloadBrowsers = (
  bridgeId: string,
  deviceId: string | null,
  tags?: string[],
  deviceIds?: string[],
) => {
  const reloadBrowsers = api.hardware.reloadBrowsers.useMutation();
  const reloadBrowsersAll = api.hardware.reloadBrowsersAll.useMutation();

  if (deviceId === null) {
    return {
      reloadBrowsers: () =>
        toast.promise(
          reloadBrowsersAll.mutateAsync({ bridgeId, tags, deviceIds }),
          {
            loading: "Reloading browsers...",
            error: "Unable to reload browsers",
            success: (data) =>
              handleFailingDevices(
                {
                  error: "reload browsers on",
                  success: "Reloaded browsers on",
                },
                data,
              ),
          },
        ),
    };
  }
  return {
    reloadBrowsers: () =>
      toast.promise(
        reloadBrowsers.mutateAsync({
          bridgeId,
          deviceId,
        }),
        {
          loading: `Reloading browsers on ${deviceId}...`,
          error: `Unable to reload browsers on ${deviceId}`,
          success: `Reloaded browsers on ${deviceId}`,
        },
      ),
  };
};

export const useCloseBrowsers = (
  bridgeId: string,
  deviceId: string | null,
  tags?: string[],
  deviceIds?: string[],
) => {
  const closeBrowsers = api.hardware.closeBrowsers.useMutation();
  const closeBrowsersAll = api.hardware.closeBrowsersAll.useMutation();

  if (deviceId === null) {
    return {
      closeBrowsers: () =>
        toast.promise(
          closeBrowsersAll.mutateAsync({ bridgeId, tags, deviceIds }),
          {
            loading: "Closing browsers...",
            error: "Failed to close browsers",
            success: (data) =>
              handleFailingDevices(
                { error: "close browsers on", success: "Closed browsers on" },
                data,
              ),
          },
        ),
    };
  }
  return {
    closeBrowsers: () =>
      toast.promise(
        closeBrowsers.mutateAsync({
          bridgeId,
          deviceId,
        }),
        {
          loading: `Closing browsers on ${deviceId}...`,
          error: `Failed to close browsers on ${deviceId}`,
          success: `Closed browsers on ${deviceId}`,
        },
      ),
  };
};

export const useOpenBrowsers = (
  bridgeId: string,
  deviceId: string | null,
  tags?: string[],
  deviceIds?: string[],
) => {
  const openBrowsers = api.hardware.openBrowsers.useMutation();
  const openBrowsersAll = api.hardware.openBrowsersAll.useMutation();

  if (deviceId === null) {
    return {
      openBrowsers: () =>
        toast.promise(
          openBrowsersAll.mutateAsync({ bridgeId, tags, deviceIds }),
          {
            loading: "Opening browsers...",
            error: "Unable to open browsers",
            success: (data) =>
              handleFailingDevices(
                { error: "open browsers on", success: "Opened browsers on" },
                data,
              ),
          },
        ),
    };
  }
  return {
    openBrowsers: () =>
      toast.promise(
        openBrowsers.mutateAsync({
          bridgeId,
          deviceId,
        }),
        {
          loading: "Opening browsers...",
          error: `Unable to open browsers on ${deviceId}`,
          success: `Opened browsers on ${deviceId}`,
        },
      ),
  };
};

export const useSetSource = (
  bridgeId: string,
  deviceId: string | null,
  tags?: string[],
  deviceIds?: string[],
) => {
  const setSource = api.hardware.setSource.useMutation();
  const setSourceAll = api.hardware.setSourceAll.useMutation();

  if (deviceId === null) {
    return {
      setSource: (source: Source) =>
        toast.promise(
          setSourceAll.mutateAsync({ bridgeId, tags, source, deviceIds }),
          {
            loading: "Setting source...",
            success: (data) =>
              handleFailingDevices(
                { error: "set source to", success: "Set source to" },
                data,
              ),
            error: "Failed to set source",
          },
        ),
    };
  }
  return {
    setSource: (source: Source) =>
      toast.promise(
        setSource.mutateAsync({
          bridgeId,
          deviceId,
          source,
        }),
        {
          loading: "Setting source...",
          error: `Failed to set source on ${deviceId}`,
          success: `Set source on ${deviceId}`,
        },
      ),
  };
};

export const useMute = (
  bridgeId: string,
  deviceId: string | null,
  tags?: string[],
  deviceIds?: string[],
) => {
  const mute = api.hardware.mute.useMutation();
  const muteAll = api.hardware.muteAll.useMutation();

  if (deviceId === null) {
    return {
      mute: () =>
        toast.promise(muteAll.mutateAsync({ bridgeId, tags, deviceIds }), {
          loading: "Muting devices...",
          error: "Failed to mute devices",
          success: (data) =>
            handleFailingDevices({ error: "mute", success: "Muted" }, data),
        }),
    };
  }
  return {
    mute: () =>
      toast.promise(
        mute.mutateAsync({
          bridgeId,
          deviceId,
        }),
        {
          loading: `Muting ${deviceId}`,
          error: `Failed to mute ${deviceId}`,
          success: `Muted ${deviceId}`,
        },
      ),
  };
};

export const useUnmute = (
  bridgeId: string,
  deviceId: string | null,
  tags?: string[],
  deviceIds?: string[],
) => {
  const unmute = api.hardware.unmute.useMutation();
  const unmuteAll = api.hardware.unmuteAll.useMutation();

  if (deviceId === null) {
    return {
      unmute: () =>
        toast.promise(unmuteAll.mutateAsync({ bridgeId, tags, deviceIds }), {
          loading: "Unmuting devices...",
          error: "Failed to unmute devices",
          success: (data) =>
            handleFailingDevices({ error: "unmute", success: "Unmuted" }, data),
        }),
    };
  }
  return {
    unmute: () =>
      toast.promise(
        unmute.mutateAsync({
          bridgeId,
          deviceId,
        }),
        {
          loading: `Unmuting ${deviceId}`,
          error: `Failed to unmute ${deviceId}`,
          success: `Unmuted ${deviceId}`,
        },
      ),
  };
};

export const useMuteAudio = (
  bridgeId: string,
  deviceId: string | null,
  tags?: string[],
  deviceIds?: string[],
) => {
  const muteAudio = api.hardware.muteAudio.useMutation();
  const muteAudioAll = api.hardware.muteAudioAll.useMutation();

  if (deviceId === null) {
    return {
      muteAudio: () =>
        toast.promise(muteAudioAll.mutateAsync({ bridgeId, tags, deviceIds }), {
          loading: "Muting audio...",
          error: "Failed to mute audio",
          success: (data) =>
            handleFailingDevices(
              { error: "mute audio on", success: "Muted audio on" },
              data,
            ),
        }),
    };
  }
  return {
    muteAudio: () =>
      toast.promise(
        muteAudio.mutateAsync({
          bridgeId,
          deviceId,
        }),
        {
          loading: `Muting audio on ${deviceId}`,
          error: `Failed to mute audio on ${deviceId}`,
          success: `Muted audio on ${deviceId}`,
        },
      ),
  };
};

export const useUnmuteAudio = (
  bridgeId: string,
  deviceId: string | null,
  tags?: string[],
  deviceIds?: string[],
) => {
  const unmuteAudio = api.hardware.unmuteAudio.useMutation();
  const unmuteAudioAll = api.hardware.unmuteAudioAll.useMutation();

  if (deviceId === null) {
    return {
      unmuteAudio: () =>
        toast.promise(
          unmuteAudioAll.mutateAsync({ bridgeId, tags, deviceIds }),
          {
            loading: "Unmuting audio...",
            error: "Failed to unmute audio",
            success: (data) =>
              handleFailingDevices(
                { error: "unmute audio on", success: "Unmuted audio on" },
                data,
              ),
          },
        ),
    };
  }
  return {
    unmuteAudio: () =>
      toast.promise(
        unmuteAudio.mutateAsync({
          bridgeId,
          deviceId,
        }),
        {
          loading: `Unmuting audio on ${deviceId}`,
          error: `Failed to unmute audio on ${deviceId}`,
          success: `Unmuted audio on ${deviceId}`,
        },
      ),
  };
};

export const useMuteVideo = (
  bridgeId: string,
  deviceId: string | null,
  tags?: string[],
  deviceIds?: string[],
) => {
  const muteVideo = api.hardware.muteVideo.useMutation();
  const muteVideoAll = api.hardware.muteVideoAll.useMutation();

  if (deviceId === null) {
    return {
      muteVideo: () =>
        toast.promise(muteVideoAll.mutateAsync({ bridgeId, tags, deviceIds }), {
          loading: "Muting video...",
          error: "Failed to mute video",
          success: (data) =>
            handleFailingDevices(
              { error: "mute video on", success: "Muted video on" },
              data,
            ),
        }),
    };
  }
  return {
    muteVideo: () =>
      toast.promise(
        muteVideo.mutateAsync({
          bridgeId,
          deviceId,
        }),
        {
          loading: `Muting video on ${deviceId}`,
          error: `Failed to mute video on ${deviceId}`,
          success: `Muted video on ${deviceId}`,
        },
      ),
  };
};

export const useUnmuteVideo = (
  bridgeId: string,
  deviceId: string | null,
  tags?: string[],
  deviceIds?: string[],
) => {
  const unmuteVideo = api.hardware.unmuteVideo.useMutation();
  const unmuteVideoAll = api.hardware.unmuteVideoAll.useMutation();

  if (deviceId === null) {
    return {
      unmuteVideo: () =>
        toast.promise(
          unmuteVideoAll.mutateAsync({ bridgeId, tags, deviceIds }),
          {
            loading: "Unmuting video...",
            error: "Failed to unmute video",
            success: (data) =>
              handleFailingDevices(
                { error: "unmute video on", success: "Unmuted video on" },
                data,
              ),
          },
        ),
    };
  }
  return {
    unmuteVideo: () =>
      toast.promise(
        unmuteVideo.mutateAsync({
          bridgeId,
          deviceId,
        }),
        {
          loading: `Unmuting video on ${deviceId}`,
          error: `Failed to unmute video on ${deviceId}`,
          success: `Unmuted video on ${deviceId}`,
        },
      ),
  };
};
