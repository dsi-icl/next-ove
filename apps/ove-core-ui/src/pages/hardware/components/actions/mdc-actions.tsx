import React from "react";
import Status from "./action/status";
import Info from "./action/info";
import Start from "./action/start";
import Shutdown from "./action/shutdown";
import Reboot from "./action/reboot";
import Input from "./action/input";
import Volume from "./action/volume";
import Mute from "./action/mute";
import Unmute from "./action/unmute";
import { type ActionController } from "../../types";

import styles from "./actions.module.scss";

const MDCActions = ({ device, bridgeId }: ActionController) =>
  <div className={styles.actions}>
    <div id={styles["info"]} className={styles.container}>
      <Status bridgeId={bridgeId} deviceId={device.id} />
      <Info bridgeId={bridgeId} deviceId={device.id} />
    </div>
    <div className={styles.container}>
      <Start bridgeId={bridgeId} deviceId={device.id} />
      <Shutdown bridgeId={bridgeId} deviceId={device.id} />
      <Reboot bridgeId={bridgeId} deviceId={device.id} />
    </div>
    <div id={styles["input"]} className={styles.container}>
      <Input bridgeId={bridgeId} deviceId={device.id} />
    </div>
    <div id={styles["volume"]} className={styles.container}>
      <Volume bridgeId={bridgeId} deviceId={device.id} />
      <Mute bridgeId={bridgeId} deviceId={device.id} />
      <Unmute bridgeId={bridgeId} deviceId={device.id} />
    </div>
  </div>;

export default MDCActions;
