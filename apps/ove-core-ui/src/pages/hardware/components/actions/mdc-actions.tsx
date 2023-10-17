import { type ActionController } from "../../types";
import {
  ArrowClockwise,
  ArrowRepeat, GpuCard,
  InfoCircle,
  PlayCircle,
  StopCircle
} from "react-bootstrap-icons";

import styles from "./actions.module.scss";

const MDCActions = ({ device, setDeviceAction }: ActionController) =>
  <div className={styles.actions}>
    <div id={styles["info"]} className={styles.container}>
      <button onClick={() => setDeviceAction({
        action: "status",
        deviceId: device.id,
        pending: false
      })} title="status">
        <ArrowRepeat />
      </button>
      <button onClick={() => setDeviceAction({
        action: "info",
        deviceId: device.id,
        pending: false
      })} title="info">
        <InfoCircle />
      </button>
    </div>
    <div className={styles.container}>
      <button onClick={() => setDeviceAction({
        action: "start",
        deviceId: device.id,
        pending: false
      })} title="start">
        <PlayCircle />
      </button>
      <button onClick={() => setDeviceAction({
        action: "shutdown",
        deviceId: device.id,
        pending: false
      })} title="shutdown">
        <StopCircle />
      </button>
      <button onClick={() => setDeviceAction({
        action: "reboot",
        deviceId: device.id,
        pending: false
      })} title="reboot">
        <ArrowClockwise />
      </button>
    </div>
    <div id={styles["input"]} className={styles.container}>
      <button onClick={() => setDeviceAction({
        action: "input_change",
        deviceId: device.id,
        pending: true
      })}>
        <GpuCard />
      </button>
    </div>
  </div>;

export default MDCActions;
