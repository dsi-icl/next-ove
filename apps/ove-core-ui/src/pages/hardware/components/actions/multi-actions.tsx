import {
  ArrowClockwise,
  ArrowRepeat,
  Camera,
  FileEarmarkCode,
  GpuCard,
  InfoCircle,
  PlayCircle,
  StopCircle,
  Window,
  WindowDash,
  WindowPlus,
  WindowX
} from "react-bootstrap-icons";
import { useStore } from "../../../../store";

import styles from "./actions.module.scss";

const MultiActions = ({bridgeId}: {bridgeId: string}) => {
  const setDeviceAction = useStore(state => state.hardwareConfig.setDeviceAction);
  return <div className={styles.actions}>
    <div id={styles["info"]} className={styles.container}>
      <button onClick={() => setDeviceAction({
        bridgeId,
        action: "status",
        deviceId: null,
        pending: false
      })} title="status">
        <ArrowRepeat />
      </button>
      <button onClick={() => setDeviceAction({
        bridgeId,
        action: "info",
        deviceId: null,
        pending: false
      })} title="info">
        <InfoCircle />
      </button>
    </div>
    <div className={styles.container}>
      <button onClick={() => setDeviceAction({
        bridgeId,
        action: "start",
        deviceId: null,
        pending: false
      })} title="start">
        <PlayCircle />
      </button>
      <button onClick={() => setDeviceAction({
        bridgeId,
        action: "shutdown",
        deviceId: null,
        pending: false
      })} title="stop">
        <StopCircle />
      </button>
      <button onClick={() => setDeviceAction({
        bridgeId,
        action: "reboot",
        deviceId: null,
        pending: false
      })} title="restart">
        <ArrowClockwise />
      </button>
    </div>
    <div className={styles.container}>
      <button onClick={() => setDeviceAction({
        bridgeId,
        action: "execute",
        deviceId: null,
        pending: false
      })} title="execute">
        <FileEarmarkCode />
      </button>
      <button onClick={() => setDeviceAction({
        bridgeId,
        action: "screenshot",
        deviceId: null,
        pending: true
      })} title="screenshot">
        <Camera />
      </button>
      <button onClick={() => setDeviceAction({
        bridgeId,
        action: "input_change",
        deviceId: null,
        pending: true
      })} title="video input">
        <GpuCard />
      </button>
    </div>
    <div id={styles["windows"]} className={styles.container}>
      <button onClick={() => setDeviceAction({
        bridgeId,
        action: "browser_status",
        deviceId: null,
        pending: false
      })} title="window status">
        <Window />
      </button>
      <button onClick={() => setDeviceAction({
        bridgeId,
        action: "browser_open",
        deviceId: null,
        pending: true
      })} title="open window">
        <WindowPlus />
      </button>
      <button onClick={() => setDeviceAction({
        bridgeId,
        action: "browser_close",
        deviceId: null,
        pending: true
      })} title="close window">
        <WindowDash />
      </button>
      <button onClick={() => setDeviceAction({
        bridgeId,
        action: "browsers_close",
        deviceId: null,
        pending: false
      })} title="close windows">
        <WindowX />
      </button>
    </div>
  </div>;
};

export default MultiActions;