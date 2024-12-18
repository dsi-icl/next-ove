import { api } from "../../../../utils/api";
import { isError } from "@ove/ove-types";
import { toast } from "sonner";
import { checkErrors } from "../../utils";
import { logger } from "../../../../env";

export const useStart = (
  bridgeId: string,
  deviceId: string | null,
  tag: string | undefined
) => {
  const start = api.hardware.start.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error(`Failed to start: ${deviceId}`);
        return;
      }
      toast.message(`Started: ${deviceId}`);
    },
    onError: () => {
      toast.error(`Failed to start: ${deviceId}`);
    }
  });
  const startAll = api.hardware.startAll.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error("Failed to start devices");
        return;
      }

      checkErrors({
        data: data.response,
        onError: ({ deviceId }) => toast.error(`Failed to start: ${deviceId}`),
        onSuccess: () => toast.info("Started devices")
      });
    },
    onError: () => toast.error("Failed to start devices")
  });

  if (deviceId === null) {
    return {
      start: () =>
        void startAll.mutateAsync({ bridgeId, tag }).catch(logger.error)
    };
  }
  return {
    start: () => void start.mutateAsync({
      bridgeId,
      deviceId: deviceId
    }).catch(logger.error)
  };
};

export const useShutdown = (
  bridgeId: string,
  deviceId: string | null,
  tag: string | undefined
) => {
  const shutdown = api.hardware.shutdown.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error(`Failed to shutdown: ${deviceId}`);
        return;
      }
      toast.message(`Shutdown: ${deviceId}`);
    },
    onError: () => {
      toast.error(`Failed to shutdown: ${deviceId}`);
    }
  });
  const shutdownAll = api.hardware.shutdownAll.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error("Failed to shutdown devices");
        return;
      }

      checkErrors({
        data: data.response,
        onError: ({ deviceId }) =>
          toast.error(`Failed to shutdown: ${deviceId}`),
        onSuccess: () => toast.info("Shutdown devices")
      });
    },
    onError: () => toast.error("Failed to shutdown devices")
  });

  if (deviceId === null) {
    return {
      shutdown: () =>
        void shutdownAll.mutateAsync({ bridgeId, tag }).catch(logger.error)
    };
  }
  return {
    shutdown: () => void shutdown.mutateAsync({
      bridgeId,
      deviceId
    }).catch(logger.error)
  };
};

export const useReboot = (
  bridgeId: string,
  deviceId: string | null,
  tag: string | undefined
) => {
  const reboot = api.hardware.reboot.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error(`Failed to reboot: ${deviceId}`);
        return;
      }
      toast.message(`Rebooted: ${deviceId}`);
    },
    onError: () => {
      toast.error(`Failed to reboot: ${deviceId}`);
    }
  });
  const rebootAll = api.hardware.rebootAll.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error("Failed to reboot devices");
        return;
      }

      checkErrors({
        data: data.response,
        onError: ({ deviceId }) => toast.error(`Failed to reboot: ${deviceId}`),
        onSuccess: () => toast.info("Rebooted devices")
      });
    },
    onError: () => toast.error("Failed to reboot devices")
  });

  if (deviceId === null) {
    return {
      reboot: () =>
        void rebootAll.mutateAsync({ bridgeId, tag }).catch(logger.error)
    };
  }
  return {
    reboot: () => void reboot.mutateAsync({
      bridgeId,
      deviceId
    }).catch(logger.error)
  };
};

export const useCloseBrowsers = (
  bridgeId: string,
  deviceId: string | null,
  tag: string | undefined
) => {
  const closeBrowsers = api.hardware.closeBrowsers.useMutation({
    retry: false,
    onSuccess: ({ response }) => {
      if (isError(response)) {
        toast.error("Unable to close browsers");
        return;
      }

      toast.info("Closed browsers");
    },
    onError: () => toast.error("Unable to close browsers")
  });
  const closeBrowsersAll = api.hardware.closeBrowsersAll.useMutation({
    retry: false,
    onSuccess: ({ response }) => {
      if (isError(response)) {
        toast.error("Unable to close browsers");
        return;
      }

      checkErrors({
        data: response,
        onSuccess: () => toast.info("Closed browsers"),
        onError: ({ deviceId }) =>
          toast.error(`Unable to close browsers on ${deviceId}`)
      });
    },
    onError: () => toast.error("Unable to close browsers")
  });

  if (deviceId === null) {
    return {
      closeBrowsers: () =>
        void closeBrowsersAll.mutateAsync({ bridgeId, tag }).catch(logger.error)
    };
  }
  return {
    closeBrowsers: () => void closeBrowsers.mutateAsync({
      bridgeId,
      deviceId
    }).catch(logger.error)
  };
};

export const useOpenBrowsers = (
  bridgeId: string,
  deviceId: string | null,
  tag: string | undefined
) => {
  const openBrowsers = api.hardware.openBrowsers.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error(`Failed to open browsers on: ${deviceId}`);
        return;
      }
      toast.message(`Open browsers on: ${deviceId}`);
    },
    onError: () => {
      toast.error(`Failed to open browsers on: ${deviceId}`);
    }
  });
  const openBrowsersAll = api.hardware.openBrowsersAll.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error("Failed to open browsers on devices");
        return;
      }

      checkErrors({
        data: data.response,
        onError: ({ deviceId }) =>
          toast.error(`Failed to open browsers on: ${deviceId}`),
        onSuccess: () => toast.info("Opened browsers")
      });
    },
    onError: () => toast.error("Failed to open browsers on devices")
  });

  if (deviceId === null) {
    return {
      openBrowsers: () =>
        void openBrowsersAll.mutateAsync({ bridgeId, tag }).catch(logger.error)
    };
  }
  return {
    openBrowsers: () => void openBrowsers.mutateAsync({
      bridgeId,
      deviceId
    }).catch(logger.error)
  };
};

export const useMute = (
  bridgeId: string,
  deviceId: string | null,
  tag: string | undefined
) => {
  const mute = api.hardware.mute.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error(`Failed to mute: ${deviceId}`);
        return;
      }
      toast.message(`Muted: ${deviceId}`);
    },
    onError: () => {
      toast.error(`Failed to mute: ${deviceId}`);
    }
  });
  const muteAll = api.hardware.muteAll.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error("Failed to mute devices");
        return;
      }

      checkErrors({
        data: data.response,
        onError: ({ deviceId }) => toast.error(`Failed to mute: ${deviceId}`),
        onSuccess: () => toast.info("Muted devices")
      });
    },
    onError: () => toast.error("Failed to mute devices")
  });

  if (deviceId === null) {
    return {
      mute: () =>
        void muteAll.mutateAsync({ bridgeId, tag }).catch(logger.error)
    };
  }
  return {
    mute: () => void mute.mutateAsync({
      bridgeId,
      deviceId
    }).catch(logger.error)
  };
};

export const useUnmute = (
  bridgeId: string,
  deviceId: string | null,
  tag: string | undefined
) => {
  const unmute = api.hardware.unmute.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error(`Failed to unmute: ${deviceId}`);
        return;
      }
      toast.message(`Unmuted: ${deviceId}`);
    },
    onError: () => {
      toast.error(`Failed to unmute: ${deviceId}`);
    }
  });
  const unmuteAll = api.hardware.unmuteAll.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error("Failed to unmute devices");
        return;
      }

      checkErrors({
        data: data.response,
        onError: ({ deviceId }) => toast.error(`Failed to unmute: ${deviceId}`),
        onSuccess: () => toast.info("Unmuted devices")
      });
    },
    onError: () => toast.error("Failed to unmute devices")
  });

  if (deviceId === null) {
    return {
      unmute: () =>
        void unmuteAll.mutateAsync({ bridgeId, tag }).catch(logger.error)
    };
  }
  return {
    unmute: () => void unmute.mutateAsync({
      bridgeId,
      deviceId
    }).catch(logger.error)
  };
};

export const useMuteAudio = (
  bridgeId: string,
  deviceId: string | null,
  tag: string | undefined
) => {
  const muteAudio = api.hardware.muteAudio.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error(`Failed to mute audio on: ${deviceId}`);
        return;
      }
      toast.message(`Muted audio on: ${deviceId}`);
    },
    onError: () => {
      toast.error(`Failed to mute audio on: ${deviceId}`);
    }
  });
  const muteAudioAll = api.hardware.muteAudioAll.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error("Failed to mute audio on devices");
        return;
      }

      checkErrors({
        data: data.response,
        onError: ({ deviceId }) =>
          toast.error(`Failed to mute audio on: ${deviceId}`),
        onSuccess: () => toast.info("Muted audio on devices")
      });
    },
    onError: () => toast.error("Failed to mute audio on devices")
  });

  if (deviceId === null) {
    return {
      muteAudio: () =>
        void muteAudioAll.mutateAsync({ bridgeId, tag }).catch(logger.error)
    };
  }
  return {
    muteAudio: () => void muteAudio.mutateAsync({
      bridgeId,
      deviceId
    }).catch(logger.error)
  };
};

export const useUnmuteAudio = (
  bridgeId: string,
  deviceId: string | null,
  tag: string | undefined
) => {
  const unmuteAudio = api.hardware.unmuteAudio.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error(`Failed to unmute audio on: ${deviceId}`);
        return;
      }
      toast.message(`Unmuted audio on: ${deviceId}`);
    },
    onError: () => {
      toast.error(`Failed to unmute audio on: ${deviceId}`);
    }
  });
  const unmuteAudioAll = api.hardware.unmuteAudioAll.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error("Failed to unmute audio on devices");
        return;
      }

      checkErrors({
        data: data.response,
        onError: ({ deviceId }) =>
          toast.error(`Failed to unmute audio on: ${deviceId}`),
        onSuccess: () => toast.info("Unmuted audio on devices")
      });
    },
    onError: () => toast.error("Failed to unmute audio on devices")
  });

  if (deviceId === null) {
    return {
      unmuteAudio: () =>
        void unmuteAudioAll.mutateAsync({ bridgeId, tag }).catch(logger.error)
    };
  }
  return {
    unmuteAudio: () => void unmuteAudio.mutateAsync({
      bridgeId,
      deviceId
    }).catch(logger.error)
  };
};

export const useMuteVideo = (
  bridgeId: string,
  deviceId: string | null,
  tag: string | undefined
) => {
  const muteVideo = api.hardware.muteVideo.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error(`Failed to mute video on: ${deviceId}`);
        return;
      }
      toast.message(`Muted video on: ${deviceId}`);
    },
    onError: () => {
      toast.error(`Failed to mute video on: ${deviceId}`);
    }
  });
  const muteVideoAll = api.hardware.muteVideoAll.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error("Failed to mute video on devices");
        return;
      }

      checkErrors({
        data: data.response,
        onError: ({ deviceId }) =>
          toast.error(`Failed to mute video on: ${deviceId}`),
        onSuccess: () => toast.info("Muted video on devices")
      });
    },
    onError: () => toast.error("Failed to mute video on devices")
  });

  if (deviceId === null) {
    return {
      muteVideo: () =>
        void muteVideoAll.mutateAsync({ bridgeId, tag }).catch(logger.error)
    };
  }
  return {
    muteVideo: () => void muteVideo.mutateAsync({
      bridgeId,
      deviceId
    }).catch(logger.error)
  };
};

export const useUnmuteVideo = (
  bridgeId: string,
  deviceId: string | null,
  tag: string | undefined
) => {
  const unmuteVideo = api.hardware.unmuteVideo.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error(`Failed to unmute video on: ${deviceId}`);
        return;
      }
      toast.message(`Unmuted video on: ${deviceId}`);
    },
    onError: () => {
      toast.error(`Failed to unmute video on: ${deviceId}`);
    }
  });
  const unmuteVideoAll = api.hardware.unmuteVideoAll.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error("Failed to unmute video on devices");
        return;
      }

      checkErrors({
        data: data.response,
        onError: ({ deviceId }) =>
          toast.error(`Failed to unmute video on: ${deviceId}`),
        onSuccess: () => toast.info("Unmuted video on devices")
      });
    },
    onError: () => toast.error("Failed to unmute video on devices")
  });

  if (deviceId === null) {
    return {
      unmuteVideo: () =>
        void unmuteVideoAll.mutateAsync({ bridgeId, tag }).catch(logger.error)
    };
  }
  return {
    unmuteVideo: () => void unmuteVideo.mutateAsync({
      bridgeId,
      deviceId
    }).catch(logger.error)
  };
};
