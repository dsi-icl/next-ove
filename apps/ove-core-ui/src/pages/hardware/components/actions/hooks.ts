import { toast } from "sonner";
import { logger } from "../../../../env";
import { api } from "../../../../utils/api";
import { checkErrors, formatIds } from "../../utils";
import { isError, type Source } from "@ove/ove-types";

export const useStart = (
  bridgeId: string,
  deviceId: string | null,
  tags?: string[],
  deviceIds?: string[],
) => {
  const start = api.hardware.start.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error(`Failed to start: ${deviceId}`);
        return;
      }
      toast.success(`Successfully started: ${deviceId}`);
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
        onError: responses => toast.error(`Failed to start: ${formatIds(responses)}`),
        onSuccess: () => toast.success("Successfully started devices")
      });
    },
    onError: () => toast.error("Failed to start devices")
  });

  if (deviceId === null) {
    return {
      start: () =>
        void startAll.mutateAsync({ bridgeId, tags, deviceIds }).catch(logger.error)
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
  tags?: string[],
  deviceIds?: string[],
) => {
  const shutdown = api.hardware.shutdown.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error(`Failed to shutdown: ${deviceId}`);
        return;
      }
      toast.success(`Successfully shutdown: ${deviceId}`);
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
        onError: responses =>
          toast.error(`Failed to shutdown: ${formatIds(responses)}`),
        onSuccess: () => toast.success("Successfully shutdown devices")
      });
    },
    onError: () => toast.error("Failed to shutdown devices")
  });

  if (deviceId === null) {
    return {
      shutdown: () =>
        void shutdownAll.mutateAsync({ bridgeId, tags, deviceIds }).catch(logger.error)
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
  tags?: string[],
  deviceIds?: string[],
) => {
  const reboot = api.hardware.reboot.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error(`Failed to reboot: ${deviceId}`);
        return;
      }
      toast.success(`Successfully rebooted: ${deviceId}`);
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
        onError: responses => toast.error(`Failed to reboot: ${formatIds(responses)}`),
        onSuccess: () => toast.success("Successfully rebooted devices")
      });
    },
    onError: () => toast.error("Failed to reboot devices")
  });

  if (deviceId === null) {
    return {
      reboot: () =>
        void rebootAll.mutateAsync({ bridgeId, tags, deviceIds }).catch(logger.error)
    };
  }
  return {
    reboot: () => void reboot.mutateAsync({
      bridgeId,
      deviceId
    }).catch(logger.error)
  };
};

export const useReloadBrowsers = (
  bridgeId: string,
  deviceId: string | null,
  tags?: string[],
  deviceIds?: string[],
) => {
  const reloadBrowsers = api.hardware.reloadBrowsers.useMutation({
    retry: false,
    onSuccess: ({ response }) => {
      if (isError(response)) {
        toast.error("Unable to reload browsers");
        return;
      }

      toast.success("Successfully reloaded browsers");
    },
    onError: () => toast.error("Unable to reload browsers")
  });
  const reloadBrowsersAll = api.hardware.reloadBrowsersAll.useMutation({
    retry: false,
    onSuccess: ({ response }) => {
      if (isError(response)) {
        toast.error("Unable to reload browsers");
        return;
      }

      checkErrors({
        data: response,
        onSuccess: () => toast.success("Successfully reloaded browsers"),
        onError: responses =>
          toast.error(`Unable to reload browsers on ${formatIds(responses)}`)
      });
    },
    onError: () => toast.error("Unable to reload browsers")
  });

  if (deviceId === null) {
    return {
      reloadBrowsers: () =>
        void reloadBrowsersAll.mutateAsync({ bridgeId, tags, deviceIds }).catch(logger.error)
    };
  }
  return {
    reloadBrowsers: () => void reloadBrowsers.mutateAsync({
      bridgeId,
      deviceId
    }).catch(logger.error)
  };
};

export const useCloseBrowsers = (
  bridgeId: string,
  deviceId: string | null,
  tags?: string[],
  deviceIds?: string[],
) => {
  const closeBrowsers = api.hardware.closeBrowsers.useMutation({
    retry: false,
    onSuccess: ({ response }) => {
      if (isError(response)) {
        toast.error("Unable to close browsers");
        return;
      }

      toast.success("Successfully closed browsers");
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
        onSuccess: () => toast.success("Successfully closed browsers"),
        onError: responses =>
          toast.error(`Unable to close browsers on ${formatIds(responses)}`)
      });
    },
    onError: () => toast.error("Unable to close browsers")
  });

  if (deviceId === null) {
    return {
      closeBrowsers: () =>
        void closeBrowsersAll.mutateAsync({ bridgeId, tags, deviceIds }).catch(logger.error)
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
  tags?: string[],
  deviceIds?: string[],
) => {
  const openBrowsers = api.hardware.openBrowsers.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error(`Failed to open browsers on: ${deviceId}`);
        return;
      }
      toast.success(`Successfully opened browsers on: ${deviceId}`);
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
        onError: responses =>
          toast.error(`Failed to open browsers on: ${formatIds(responses)}`),
        onSuccess: () => toast.success("Successfully opened browsers")
      });
    },
    onError: () => toast.error("Failed to open browsers on devices")
  });

  if (deviceId === null) {
    return {
      openBrowsers: () =>
        void openBrowsersAll.mutateAsync({ bridgeId, tags, deviceIds }).catch(logger.error)
    };
  }
  return {
    openBrowsers: () => void openBrowsers.mutateAsync({
      bridgeId,
      deviceId
    }).catch(logger.error)
  };
};

export const useSetSource = (
  bridgeId: string,
  deviceId: string | null,
  tags?: string[],
  deviceIds?: string[],
) => {
  const setSource = api.hardware.setSource.useMutation({
    retry: false,
    onSuccess: ({ response }) => {
      if (isError(response)) {
        toast.error("Unable to set source");
        return;
      }

      toast.success("Successfully set source");
    },
    onError: () => toast.error("Unable to set source")
  });
  const setSourceAll = api.hardware.setSourceAll.useMutation({
    retry: false,
    onSuccess: ({ response }) => {
      if (isError(response)) {
        toast.error("Unable to set source");
        return;
      }

      checkErrors({
        data: response,
        onSuccess: () => toast.success("Successfully set source"),
        onError: responses =>
          toast.error(`Unable to set source on ${formatIds(responses)}`)
      });
    },
    onError: () => toast.error("Unable to set source")
  });

  if (deviceId === null) {
    return {
      setSource: (source: Source) =>
        void setSourceAll.mutateAsync({ bridgeId, tags, source, deviceIds }).catch(logger.error)
    };
  }
  return {
    setSource: (source: Source) => void setSource.mutateAsync({
      bridgeId,
      deviceId,
      source
    }).catch(logger.error)
  };
};

export const useMute = (
  bridgeId: string,
  deviceId: string | null,
  tags?: string[],
  deviceIds?: string[]
) => {
  const mute = api.hardware.mute.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error(`Failed to mute: ${deviceId}`);
        return;
      }
      toast.success(`Successfully muted: ${deviceId}`);
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
        onError: responses => toast.error(`Failed to mute: ${formatIds(responses)}`),
        onSuccess: () => toast.success("Successfully muted devices")
      });
    },
    onError: () => toast.error("Failed to mute devices")
  });

  if (deviceId === null) {
    return {
      mute: () =>
        void muteAll.mutateAsync({ bridgeId, tags, deviceIds }).catch(logger.error)
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
  tags?: string[],
  deviceIds?: string[],
) => {
  const unmute = api.hardware.unmute.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error(`Failed to unmute: ${deviceId}`);
        return;
      }
      toast.success(`Successfully unmuted: ${deviceId}`);
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
        onError: responses => toast.error(`Failed to unmute: ${formatIds(responses)}`),
        onSuccess: () => toast.success("Successfully unmuted devices")
      });
    },
    onError: () => toast.error("Failed to unmute devices")
  });

  if (deviceId === null) {
    return {
      unmute: () =>
        void unmuteAll.mutateAsync({ bridgeId, tags, deviceIds }).catch(logger.error)
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
  tags?: string[],
  deviceIds?: string[],
) => {
  const muteAudio = api.hardware.muteAudio.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error(`Failed to mute audio on: ${deviceId}`);
        return;
      }
      toast.success(`Successfully muted audio on: ${deviceId}`);
    },
    onError: () => {
      toast.error(`Failed to mute audio on: ${deviceId}`);
    }
  });
  const muteAudioAll = api.hardware.muteAudioAll.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error("Failed to mute audio");
        return;
      }

      checkErrors({
        data: data.response,
        onError: responses =>
          toast.error(`Failed to mute audio on: ${formatIds(responses)}`),
        onSuccess: () => toast.success("Muted audio")
      });
    },
    onError: () => toast.error("Failed to mute audio")
  });

  if (deviceId === null) {
    return {
      muteAudio: () =>
        void muteAudioAll.mutateAsync({ bridgeId, tags, deviceIds }).catch(logger.error)
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
  tags?: string[],
  deviceIds?: string[],
) => {
  const unmuteAudio = api.hardware.unmuteAudio.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error(`Failed to unmute audio on: ${deviceId}`);
        return;
      }
      toast.success(`Successfully unmuted audio on: ${deviceId}`);
    },
    onError: () => {
      toast.error(`Failed to unmute audio on: ${deviceId}`);
    }
  });
  const unmuteAudioAll = api.hardware.unmuteAudioAll.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error("Failed to unmute audio");
        return;
      }

      checkErrors({
        data: data.response,
        onError: responses =>
          toast.error(`Failed to unmute audio on: ${formatIds(responses)}`),
        onSuccess: () => toast.success("Successfully unmuted audio")
      });
    },
    onError: () => toast.error("Failed to unmute audio")
  });

  if (deviceId === null) {
    return {
      unmuteAudio: () =>
        void unmuteAudioAll.mutateAsync({ bridgeId, tags, deviceIds }).catch(logger.error)
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
  tags?: string[],
  deviceIds?: string[],
) => {
  const muteVideo = api.hardware.muteVideo.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error(`Failed to mute video on: ${deviceId}`);
        return;
      }
      toast.success(`Successfully muted video on: ${deviceId}`);
    },
    onError: () => {
      toast.error(`Failed to mute video on: ${deviceId}`);
    }
  });
  const muteVideoAll = api.hardware.muteVideoAll.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error("Failed to mute video");
        return;
      }

      checkErrors({
        data: data.response,
        onError: responses =>
          toast.error(`Failed to mute video on: ${formatIds(responses)}`),
        onSuccess: () => toast.success("Successfully muted video")
      });
    },
    onError: () => toast.error("Failed to mute video")
  });

  if (deviceId === null) {
    return {
      muteVideo: () =>
        void muteVideoAll.mutateAsync({ bridgeId, tags, deviceIds }).catch(logger.error)
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
  tags?: string[],
  deviceIds?: string[],
) => {
  const unmuteVideo = api.hardware.unmuteVideo.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error(`Failed to unmute video on: ${deviceId}`);
        return;
      }
      toast.success(`Successfully unmuted video on: ${deviceId}`);
    },
    onError: () => {
      toast.error(`Failed to unmute video on: ${deviceId}`);
    }
  });
  const unmuteVideoAll = api.hardware.unmuteVideoAll.useMutation({
    onSuccess: data => {
      if (isError(data.response)) {
        toast.error("Failed to unmute video");
        return;
      }

      checkErrors({
        data: data.response,
        onError: responses =>
          toast.error(`Failed to unmute video on: ${formatIds(responses)}`),
        onSuccess: () => toast.success("Successfully unmuted video")
      });
    },
    onError: () => toast.error("Failed to unmute video")
  });

  if (deviceId === null) {
    return {
      unmuteVideo: () =>
        void unmuteVideoAll.mutateAsync({ bridgeId, tags, deviceIds }).catch(logger.error)
    };
  }
  return {
    unmuteVideo: () => void unmuteVideo.mutateAsync({
      bridgeId,
      deviceId
    }).catch(logger.error)
  };
};
