import React from "react";
import { type ActionController } from "../../types";
import {
  ArrowClockwise,
  ArrowRepeat, GpuCard,
  InfoCircle,
  PlayCircle,
  StopCircle, VolumeDown, VolumeMute, VolumeUp
} from "react-bootstrap-icons";
import { useStore } from "../../../../store";

import styles from "./actions.module.scss";
import { trpc } from "../../../../utils/api";

const MDCActions = ({ device, bridgeId }: ActionController) => {
  const getStatus = trpc.hardware.getStatus.useQuery({
    bridgeId,
    deviceId: device.id
  }, { enabled: false });
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
        getStatus.refetch();
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
    <div className={styles.container}>
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
    <div id={styles["input"]} className={styles.container}>
      <button onClick={() => setDeviceAction({
        bridgeId,
        action: "input_change",
        deviceId: device.id,
        pending: true
      })} title="input source">
        <GpuCard />
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
    </div>
  </div>;
};

export default MDCActions;
