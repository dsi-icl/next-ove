import { useStore } from "../../../../store";
import { Calendar, CameraVideo, Power } from "react-bootstrap-icons";

import styles from "./header.module.scss";

const Header = ({ name, isOnline }: {
  name: string,
  isOnline: boolean
}) => {
  const setDeviceAction = useStore(state => state.hardwareConfig.setDeviceAction);

  return <div className={styles.header}>
    <h2>Observatory {name} - {isOnline ? "online" : "offline"}</h2>
    {isOnline ? <div className={styles.actions}>
      <button className={styles.icon} onClick={() => setDeviceAction({
        bridgeId: name,
        action: "monitoring",
        deviceId: null,
        pending: false
      })}>
        <CameraVideo /></button>
      <button className={styles.icon} onClick={() => setDeviceAction({
        bridgeId: name,
        action: "calendar",
        deviceId: null,
        pending: false
      })}>
        <Calendar /></button>
      <button className={styles.icon} onClick={() => setDeviceAction({
        bridgeId: name,
        action: "power_mode",
        deviceId: null,
        pending: false
      })}>
        <Power /></button>
    </div> : null}
  </div>;
};

export default Header;