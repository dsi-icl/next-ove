import { type ActionController } from "../../types";
import {
  ArrowClockwise,
  ArrowRepeat,
  InfoCircle,
  PlayCircle,
  StopCircle
} from "react-bootstrap-icons";

import styles from "./actions.module.scss";

const ProjectorActions = ({ device, setDeviceAction }: ActionController) =>
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
    <div id={styles["power"]} className={styles.container}>
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
  </div>;

export default ProjectorActions;
