import {
  ArrowClockwise,
  ArrowRepeat,
  Camera,
  FileEarmarkCode,
  InfoCircle,
  PlayCircle,
  StopCircle,
  Window,
  WindowDash,
  WindowPlus,
  WindowX
} from "react-bootstrap-icons";

import styles from "./actions.module.scss";
import { type ActionController } from "../../types";
import { useStore } from "../../../../store";

const NodeActions = ({ device, bridgeId }: ActionController) => {
  const setDeviceAction = useStore(state => state.hardwareConfig.setDeviceAction);

  return <div
    className={styles.actions}>
    <div id={styles["info"]} className={styles.container}>
      <button onClick={() => setDeviceAction({
        bridgeId,
        action: "status",
        deviceId: device.id,
        pending: false
      })} title="status">
        <ArrowRepeat />
      </button>
      <button
        onClick={() => setDeviceAction({
          bridgeId,
          deviceId: device.id,
          action: "info",
          pending: false
        })}
        title="info">
        <InfoCircle />
      </button>
    </div>
    <div className={styles.container}>
      <button
        onClick={() => setDeviceAction({
          bridgeId,
          deviceId: device.id,
          action: "start",
          pending: false
        })}
        title="start">
        <PlayCircle />
      </button>
      <button onClick={() => setDeviceAction({
        bridgeId,
        deviceId: device.id,
        action: "shutdown",
        pending: false
      })}
              title="stop">
        <StopCircle />
      </button>
      <button
        onClick={() => setDeviceAction({
          bridgeId,
          deviceId: device.id,
          action: "reboot",
          pending: false
        })}
        title="restart">
        <ArrowClockwise />
      </button>
    </div>
    <div className={styles.container}>
      <button onClick={() => setDeviceAction({
        bridgeId,
        deviceId: device.id,
        action: "execute",
        pending: false
      })} title="execute">
        <FileEarmarkCode />
      </button>
      <button onClick={() => setDeviceAction({
        bridgeId,
        deviceId: device.id,
        action: "screenshot",
        pending: true
      })} title="screenshot">
        <Camera />
      </button>
    </div>
    <div id={styles["windows"]} className={styles.container}>
      <button onClick={() => setDeviceAction({
        bridgeId,
        deviceId: device.id,
        action: "browser_status",
        pending: true
      })} title="window status">
        <Window />
      </button>
      <button onClick={() => setDeviceAction({
        bridgeId,
        deviceId: device.id,
        action: "browser_open",
        pending: true
      })} title="open window">
        <WindowPlus />
      </button>
      <button onClick={() => setDeviceAction({
        bridgeId,
        deviceId: device.id,
        action: "browser_close",
        pending: true
      })} title="close window">
        <WindowDash />
      </button>
      <button onClick={() => setDeviceAction({
        bridgeId,
        deviceId: device.id,
        action: "browsers_close",
        pending: false
      })} title="close windows">
        <WindowX />
      </button>
    </div>
  </div>;
};

export default NodeActions;