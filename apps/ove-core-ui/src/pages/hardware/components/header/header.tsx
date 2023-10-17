import { Calendar, CameraVideo } from "react-bootstrap-icons";

import styles from "./header.module.scss";
import { DeviceAction } from "../../types";

const Header = ({ name, setDeviceAction, isOnline }: {
  name: string,
  setDeviceAction: (deviceAction: DeviceAction) => void,
  isOnline: boolean
}) =>
  <div className={styles.header}>
    <h2>Observatory {name} - {isOnline ? "online" : "offline"}</h2>
    {isOnline ? <div className={styles.actions}>
      <button className={styles.icon} onClick={() => setDeviceAction({
        action: "monitoring",
        deviceId: null,
        pending: false
      })}>
        <CameraVideo /></button>
      <button className={styles.icon} onClick={() => setDeviceAction({
        action: "calendar",
        deviceId: null,
        pending: false
      })}>
        <Calendar /></button>
    </div> : null}
  </div>;

export default Header;