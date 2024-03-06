import React from "react";
import { type ActionController } from "../../types";
import {
  ArrowClockwise,
  ArrowRepeat, CameraVideo,
  InfoCircle, Mic,
  PlayCircle,
  StopCircle, VolumeDown, VolumeMute, VolumeUp
} from "react-bootstrap-icons";
import { useStore } from "../../../../store";

import styles from "./actions.module.scss";

const ProjectorActions = ({ device, bridgeId, refetch }: ActionController) => {
  const setDeviceAction = useStore(state =>
    state.hardwareConfig.setDeviceAction);
  return <div className={styles.actions}>
    <div id={styles["info"]} className={styles.container}>
      <button onClick={() => {
        setDeviceAction({
          bridgeId,
          action: "status",
          deviceId: device.id,
          pending: false
        });
        refetch.single();
      }} title="status">
        <ArrowRepeat />
      </button>
      <button onClick={() => setDeviceAction({
        bridgeId,
        action: "info",
        deviceId: device.id,
        pending: false
      })} title="info">
        <InfoCircle />
      </button>
    </div>
    <div id={styles["power"]} className={styles.container}>
      <button onClick={() => setDeviceAction({
        bridgeId,
        action: "start",
        deviceId: device.id,
        pending: false
      })} title="start">
        <PlayCircle />
      </button>
      <button onClick={() => setDeviceAction({
        bridgeId,
        action: "shutdown",
        deviceId: device.id,
        pending: false
      })} title="shutdown">
        <StopCircle />
      </button>
      <button onClick={() => setDeviceAction({
        bridgeId,
        action: "reboot",
        deviceId: device.id,
        pending: false
      })} title="reboot">
        <ArrowClockwise />
      </button>
    </div>
    <div id={styles["volume"]} className={styles.container}>
      <button onClick={() => setDeviceAction({
        bridgeId,
        action: "volume",
        deviceId: device.id,
        pending: true
      })} title="set volume">
        <VolumeDown />
      </button>
      <button onClick={() => setDeviceAction({
        bridgeId,
        action: "mute",
        deviceId: device.id,
        pending: false
      })} title="mute">
        <VolumeMute />
      </button>
      <button onClick={() => setDeviceAction({
        bridgeId,
        action: "unmute",
        deviceId: device.id,
        pending: false
      })} title="unmute">
        <VolumeUp />
      </button>
      <button onClick={() => setDeviceAction({
        bridgeId,
        action: "audio_mute",
        deviceId: device.id,
        pending: false
      })} title="mute audio" className={styles.composite}>
        <Mic className={styles.primary} />
        <VolumeMute size="40%" className={styles.secondary} />
      </button>
      <button onClick={() => setDeviceAction({
        bridgeId,
        action: "audio_unmute",
        deviceId: device.id,
        pending: false
      })} title="unmute audio" className={styles.composite}>
        <Mic className={styles.primary} />
        <VolumeUp size="40%" className={styles.secondary} />
      </button>
      <button onClick={() => setDeviceAction({
        bridgeId,
        action: "video_mute",
        deviceId: device.id,
        pending: false
      })} title="mute video" className={styles.composite}>
        <CameraVideo className={styles.primary} />
        <VolumeMute size="40%" className={styles.secondary} />
      </button>
      <button onClick={() => setDeviceAction({
        bridgeId,
        action: "video_unmute",
        deviceId: device.id,
        pending: false
      })} title="unmute video" className={styles.composite}>
        <CameraVideo className={styles.primary} />
        <VolumeUp size="40%" className={styles.secondary} />
      </button>
    </div>
  </div>;
};

export default ProjectorActions;
