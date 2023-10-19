import { type ActionController } from "../../types";
import {
  ArrowClockwise,
  ArrowRepeat,
  InfoCircle,
  PlayCircle,
  StopCircle
} from "react-bootstrap-icons";

import styles from "./actions.module.scss";
import { useStore } from "../../../../store";

const ProjectorActions = ({ device, bridgeId }: ActionController) => {
  const setDeviceAction = useStore(state => state.hardwareConfig.setDeviceAction);
  return <div className={styles.actions}>
    <div id={styles["info"]} className={styles.container}>
      <button onClick={() => setDeviceAction({
        bridgeId,
        action: "status",
        deviceId: device.id,
        pending: false
      })} title="status">
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
  </div>;
};

export default ProjectorActions;
